"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "../../lib/auth-context";
import { supabase } from "../../lib/supabase-client";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Search, Calendar, MapPin, Users, Plus, Clock } from "lucide-react";

interface EventItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  cover_image_url: string;
  event_type: string;
  start_at: string;
  end_at: string;
  location: string;
  is_online: boolean;
  max_attendees: number;
  total_attendees: number;
  status: string;
  organizer: { username: string; display_name: string };
}

export default function EventsPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchEvents = async () => {
      const { data } = await supabase
        .from("events")
        .select("*, organizer:profiles(username, display_name)")
        .in("status", ["upcoming", "ongoing"])
        .order("start_at", { ascending: true });
      setEvents(data || []);
      setLoading(false);
    };
    fetchEvents();
  }, []);

  const filteredEvents = events.filter((e) =>
    e.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container-wide flex h-16 items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tight">NovelSpace</Link>
          <nav className="flex items-center gap-4">
            <Link href="/events">
              <Button variant="ghost">Events</Button>
            </Link>
            {user && (
              <Link href="/events/new">
                <Button><Plus className="h-4 w-4" /> Create Event</Button>
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main className="container-wide py-8">
        <h1 className="text-3xl font-bold tracking-tight">Events</h1>
        <p className="mt-2 text-muted-foreground">Join writing events, book clubs, and community gatherings</p>

        <div className="mt-6 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search events..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        {loading ? (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="skeleton h-72 w-full" />
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="mt-8 rounded-lg border border-dashed p-12 text-center">
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No events found</h3>
            <p className="mt-2 text-muted-foreground">Check back later for upcoming events!</p>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.map((event) => (
              <Link key={event.id} href={`/event/${event.slug}`}>
                <div className="rounded-lg border bg-card shadow-sm transition-all hover:shadow-lg">
                  <div className="aspect-video w-full overflow-hidden rounded-t-lg bg-muted">
                    {event.cover_image_url ? (
                      <img src={event.cover_image_url} alt={event.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Calendar className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-2">
                      <span className="badge border-transparent bg-blue-100 text-blue-800">{event.event_type}</span>
                      <span className={`badge ${event.status === 'ongoing' ? 'badge-status' : 'badge-status-draft'}`}>
                        {event.status}
                      </span>
                    </div>
                    <h3 className="mt-2 font-semibold line-clamp-1">{event.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{event.description}</p>
                    <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        {new Date(event.start_at).toLocaleString()}
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3 w-3" />
                          {event.location}
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Users className="h-3 w-3" />
                        {event.total_attendees} attending
                        {event.max_attendees && ` / ${event.max_attendees} max`}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
