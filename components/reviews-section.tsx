"use client";

import { useState } from "react";
import { useAuth } from "../lib/auth-context";
import { supabase } from "../lib/supabase-client";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Star, Send } from "lucide-react";

interface Review {
  id: string;
  rating: number;
  title: string;
  content: string;
  is_recommended: boolean;
  helpful_count: number;
  created_at: string;
  user: { username: string; display_name: string; avatar_url: string };
}

interface ReviewsSectionProps {
  novelId: string;
  novelTitle: string;
}

export default function ReviewsSection({ novelId, novelTitle }: ReviewsSectionProps) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const fetchReviews = async () => {
      const { data } = await supabase
        .from("reviews")
        .select("*, user:profiles(username, display_name, avatar_url)")
        .eq("novel_id", novelId)
        .eq("status", "published")
        .order("created_at", { ascending: false });
      setReviews(data || []);
    };
    fetchReviews();
  }, [novelId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || rating === 0 || !content.trim()) return;

    setLoading(true);
    const { error } = await supabase.from("reviews").insert({
      user_id: user.id,
      novel_id: novelId,
      rating,
      title: title.trim(),
      content: content.trim(),
      is_recommended: rating >= 3,
    });

    if (!error) {
      setRating(0);
      setTitle("");
      setContent("");
      setShowForm(false);
      const { data } = await supabase
        .from("reviews")
        .select("*, user:profiles(username, display_name, avatar_url)")
        .eq("novel_id", novelId)
        .eq("status", "published")
        .order("created_at", { ascending: false });
      setReviews(data || []);
    }
    setLoading(false);
  };

  const renderStars = (count: number, interactive = false) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && setRating(star)}
            onMouseEnter={() => interactive && setHoverRating(star)}
            onMouseLeave={() => interactive && setHoverRating(0)}
            className={`${interactive ? "cursor-pointer" : "cursor-default"} ${
              star <= (interactive ? hoverRating || rating : count)
                ? "text-yellow-500"
                : "text-muted-foreground"
            }`}
          >
            <Star className="h-4 w-4" fill={star <= (interactive ? hoverRating || rating : count) ? "currentColor" : "none"} />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="mt-12">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Reviews ({reviews.length})</h2>
        {user && (
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? "Cancel" : "Write a Review"}
          </Button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mt-6 space-y-4 rounded-lg border bg-card p-6">
          <div>
            <label className="text-sm font-medium">Rating</label>
            <div className="mt-2">{renderStars(rating, true)}</div>
          </div>
          <div>
            <label htmlFor="review-title" className="text-sm font-medium">Title</label>
            <Input
              id="review-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Summary of your review"
            />
          </div>
          <div>
            <label htmlFor="review-content" className="text-sm font-medium">Review</label>
            <textarea
              id="review-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your thoughts..."
              rows={4}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              required
            />
          </div>
          <Button type="submit" disabled={loading || rating === 0}>
            <Send className="h-4 w-4" /> {loading ? "Submitting..." : "Submit Review"}
          </Button>
        </form>
      )}

      {reviews.length === 0 ? (
        <p className="mt-6 text-muted-foreground">No reviews yet. Be the first to review!</p>
      ) : (
        <div className="mt-6 space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="rounded-lg border bg-card p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 overflow-hidden rounded-full bg-muted">
                    {review.user?.avatar_url ? (
                      <img src={review.user.avatar_url} alt={review.user.display_name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-sm font-medium">
                        {review.user?.display_name?.[0] || "?"}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{review.user?.display_name}</p>
                    <p className="text-xs text-muted-foreground">{new Date(review.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                {renderStars(review.rating)}
              </div>
              {review.title && <h4 className="mt-4 font-semibold">{review.title}</h4>}
              <p className="mt-2 text-sm text-muted-foreground">{review.content}</p>
              <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                <span>{review.is_recommended ? "👍 Recommended" : "👎 Not Recommended"}</span>
                <span>{review.helpful_count} found helpful</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
