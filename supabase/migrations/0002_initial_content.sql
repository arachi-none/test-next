-- NovelSpace Database Migration 1.1
-- Novels, Chapters, Bookmarks, Reviews, Comments, Groups, Forums, Events, Notifications, Analytics

-- =====================================================
-- NOVELS
-- =====================================================

CREATE TABLE IF NOT EXISTS novels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  synopsis TEXT,
  cover_image_url TEXT,
  genre_id UUID REFERENCES genres(id),
  tags UUID[] DEFAULT '{}',
  age_rating_id UUID REFERENCES age_ratings(id),
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'unpublished', 'scheduled', 'completed')),
  visibility VARCHAR(20) DEFAULT 'public' CHECK (visibility IN ('public', 'private', 'unlisted')),
  language VARCHAR(10) DEFAULT 'en',
  total_chapters INTEGER DEFAULT 0,
  total_views BIGINT DEFAULT 0,
  total_bookmarks BIGINT DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  avg_rating DECIMAL(3,2) DEFAULT 0,
  total_likes BIGINT DEFAULT 0,
  total_comments INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  is_trending BOOLEAN DEFAULT FALSE,
  is_editors_pick BOOLEAN DEFAULT FALSE,
  is_rising_writer BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  scheduled_at TIMESTAMPTZ,
  last_chapter_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- NOVEL CHAPTERS
-- =====================================================

CREATE TABLE IF NOT EXISTS novel_chapters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  novel_id UUID REFERENCES novels(id) ON DELETE CASCADE,
  chapter_number INTEGER NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  word_count INTEGER DEFAULT 0,
  author_notes TEXT,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'scheduled')),
  is_free BOOLEAN DEFAULT TRUE,
  price DECIMAL(10,2) DEFAULT 0,
  total_views BIGINT DEFAULT 0,
  total_likes BIGINT DEFAULT 0,
  total_comments INTEGER DEFAULT 0,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(novel_id, chapter_number)
);

-- =====================================================
-- BOOKMARKS & READING LISTS
-- =====================================================

CREATE TABLE IF NOT EXISTS bookmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  novel_id UUID REFERENCES novels(id) ON DELETE CASCADE,
  chapter_id UUID REFERENCES novel_chapters(id) ON DELETE SET NULL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, novel_id)
);

CREATE TABLE IF NOT EXISTS reading_lists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT true,
  total_items INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reading_list_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  list_id UUID REFERENCES reading_lists(id) ON DELETE CASCADE,
  novel_id UUID REFERENCES novels(id) ON DELETE CASCADE,
  sort_order INTEGER DEFAULT 0,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(list_id, novel_id)
);

-- =====================================================
-- READING PROGRESS
-- =====================================================

CREATE TABLE IF NOT EXISTS reading_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  novel_id UUID REFERENCES novels(id) ON DELETE CASCADE,
  chapter_id UUID REFERENCES novel_chapters(id) ON DELETE CASCADE,
  progress_percent DECIMAL(5,2) DEFAULT 0,
  is_completed BOOLEAN DEFAULT FALSE,
  last_read_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, novel_id)
);

-- =====================================================
-- LIKES & FOLLOWS
-- =====================================================

CREATE TABLE IF NOT EXISTS likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  target_type VARCHAR(20) NOT NULL CHECK (target_type IN ('novel', 'chapter', 'comment', 'group_post')),
  target_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, target_type, target_id)
);

CREATE TABLE IF NOT EXISTS followers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  following_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);

-- =====================================================
-- REVIEWS & RATINGS
-- =====================================================

CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  novel_id UUID REFERENCES novels(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255),
  content TEXT NOT NULL,
  is_recommended BOOLEAN DEFAULT TRUE,
  helpful_count INTEGER DEFAULT 0,
  is_spoiler BOOLEAN DEFAULT FALSE,
  status VARCHAR(20) DEFAULT 'published' CHECK (status IN ('published', 'hidden', 'flagged')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, novel_id)
);

-- =====================================================
-- COMMENTS & REPLIES
-- =====================================================

CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  target_type VARCHAR(20) NOT NULL CHECK (target_type IN ('novel', 'chapter', 'group_post', 'forum_post')),
  target_id UUID NOT NULL,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_edited BOOLEAN DEFAULT FALSE,
  is_deleted BOOLEAN DEFAULT FALSE,
  is_flagged BOOLEAN DEFAULT FALSE,
  total_likes INTEGER DEFAULT 0,
  total_replies INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- GROUPS
-- =====================================================

CREATE TABLE IF NOT EXISTS groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  creator_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  privacy VARCHAR(20) DEFAULT 'public' CHECK (privacy IN ('public', 'private', 'secret')),
  total_members INTEGER DEFAULT 0,
  total_posts INTEGER DEFAULT 0,
  rules TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS group_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('member', 'moderator', 'admin')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

CREATE TABLE IF NOT EXISTS group_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title VARCHAR(255),
  content TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT FALSE,
  is_locked BOOLEAN DEFAULT FALSE,
  total_comments INTEGER DEFAULT 0,
  total_likes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- FORUMS
-- =====================================================

CREATE TABLE IF NOT EXISTS forums (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  category VARCHAR(100),
  total_topics INTEGER DEFAULT 0,
  total_posts INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS forum_topics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  forum_id UUID REFERENCES forums(id) ON DELETE CASCADE,
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  content TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT FALSE,
  is_locked BOOLEAN DEFAULT FALSE,
  is_solved BOOLEAN DEFAULT FALSE,
  total_posts INTEGER DEFAULT 0,
  total_views BIGINT DEFAULT 0,
  last_post_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS forum_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic_id UUID REFERENCES forum_topics(id) ON DELETE CASCADE,
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_edited BOOLEAN DEFAULT FALSE,
  is_solution BOOLEAN DEFAULT FALSE,
  total_likes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- EVENTS
-- =====================================================

CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  organizer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  event_type VARCHAR(50) NOT NULL,
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ NOT NULL,
  location TEXT,
  is_online BOOLEAN DEFAULT TRUE,
  meeting_url TEXT,
  max_attendees INTEGER,
  total_attendees INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS event_attendees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'registered' CHECK (status IN ('registered', 'attended', 'cancelled')),
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- =====================================================
-- NOTIFICATIONS
-- =====================================================

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT,
  link TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- REPORTS & MODERATION
-- =====================================================

CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  target_type VARCHAR(20) NOT NULL CHECK (target_type IN ('novel', 'chapter', 'comment', 'review', 'user', 'group', 'forum')),
  target_id UUID NOT NULL,
  reason VARCHAR(100) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'resolved', 'dismissed')),
  resolved_by UUID REFERENCES profiles(id),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS moderation_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  moderator_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  target_type VARCHAR(20) NOT NULL,
  target_id UUID NOT NULL,
  action VARCHAR(50) NOT NULL,
  reason TEXT,
  duration INTERVAL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- FEATURED & TRENDING CONTENT
-- =====================================================

CREATE TABLE IF NOT EXISTS featured_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_type VARCHAR(20) NOT NULL CHECK (content_type IN ('novel', 'writer', 'group', 'event')),
  content_id UUID NOT NULL,
  featured_by UUID REFERENCES profiles(id),
  featured_from TIMESTAMPTZ DEFAULT NOW(),
  featured_until TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS trending_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_type VARCHAR(20) NOT NULL CHECK (content_type IN ('novel', 'writer', 'group')),
  content_id UUID NOT NULL,
  score DECIMAL(10,2) DEFAULT 0,
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ANALYTICS EVENTS
-- =====================================================

CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  session_id VARCHAR(100),
  event_type VARCHAR(50) NOT NULL,
  target_type VARCHAR(20),
  target_id UUID,
  metadata JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- AUDIT LOGS
-- =====================================================

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  target_type VARCHAR(50),
  target_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Novels
CREATE INDEX idx_novels_author_id ON novels(author_id);
CREATE INDEX idx_novels_status ON novels(status);
CREATE INDEX idx_novels_genre_id ON novels(genre_id);
CREATE INDEX idx_novels_published_at ON novels(published_at DESC);
CREATE INDEX idx_novels_total_views ON novels(total_views DESC);
CREATE INDEX idx_novels_avg_rating ON novels(avg_rating DESC);
CREATE INDEX idx_novels_is_featured ON novels(is_featured);
CREATE INDEX idx_novels_is_trending ON novels(is_trending);
CREATE INDEX idx_novels_is_editors_pick ON novels(is_editors_pick);
CREATE INDEX idx_novels_is_rising_writer ON novels(is_rising_writer);
CREATE INDEX idx_novels_last_chapter_at ON novels(last_chapter_at DESC);

-- Chapters
CREATE INDEX idx_novel_chapters_novel_id ON novel_chapters(novel_id);
CREATE INDEX idx_novel_chapters_status ON novel_chapters(status);
CREATE INDEX idx_novel_chapters_published_at ON novel_chapters(published_at DESC);

-- Bookmarks & Reading
CREATE INDEX idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX idx_bookmarks_novel_id ON bookmarks(novel_id);
CREATE INDEX idx_reading_lists_user_id ON reading_lists(user_id);
CREATE INDEX idx_reading_progress_user_id ON reading_progress(user_id);

-- Social
CREATE INDEX idx_likes_target ON likes(target_type, target_id);
CREATE INDEX idx_followers_follower_id ON followers(follower_id);
CREATE INDEX idx_followers_following_id ON followers(following_id);

-- Reviews
CREATE INDEX idx_reviews_novel_id ON reviews(novel_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);

-- Comments
CREATE INDEX idx_comments_target ON comments(target_type, target_id);
CREATE INDEX idx_comments_parent_id ON comments(parent_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);

-- Groups
CREATE INDEX idx_group_members_group_id ON group_members(group_id);
CREATE INDEX idx_group_members_user_id ON group_members(user_id);
CREATE INDEX idx_group_posts_group_id ON group_posts(group_id);

-- Forums
CREATE INDEX idx_forum_topics_forum_id ON forum_topics(forum_id);
CREATE INDEX idx_forum_posts_topic_id ON forum_posts(topic_id);

-- Events
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_start_at ON events(start_at);
CREATE INDEX idx_event_attendees_event_id ON event_attendees(event_id);

-- Notifications
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

-- Analytics
CREATE INDEX idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_events_created_at ON analytics_events(created_at);

-- Audit
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- =====================================================
-- TRIGGERS
-- =====================================================

CREATE TRIGGER update_novels_updated_at BEFORE UPDATE ON novels
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_novel_chapters_updated_at BEFORE UPDATE ON novel_chapters
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reading_lists_updated_at BEFORE UPDATE ON reading_lists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_groups_updated_at BEFORE UPDATE ON groups
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_group_posts_updated_at BEFORE UPDATE ON group_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_forum_topics_updated_at BEFORE UPDATE ON forum_topics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_forum_posts_updated_at BEFORE UPDATE ON forum_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE novels ENABLE ROW LEVEL SECURITY;
ALTER TABLE novel_chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE followers ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE forums ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE featured_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE trending_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Novels: public can read published, owner can manage
CREATE POLICY novels_select ON novels FOR SELECT
  USING (status = 'published' OR visibility = 'public' OR author_id = auth.uid());

CREATE POLICY novels_insert ON novels FOR INSERT
  WITH CHECK (author_id = auth.uid());

CREATE POLICY novels_update ON novels FOR UPDATE
  USING (author_id = auth.uid());

CREATE POLICY novels_delete ON novels FOR DELETE
  USING (author_id = auth.uid());

-- Chapters: public can read published, owner can manage
CREATE POLICY novel_chapters_select ON novel_chapters FOR SELECT
  USING (status = 'published' OR novel_id IN (SELECT id FROM novels WHERE author_id = auth.uid()));

CREATE POLICY novel_chapters_insert ON novel_chapters FOR INSERT
  WITH CHECK (novel_id IN (SELECT id FROM novels WHERE author_id = auth.uid()));

CREATE POLICY novel_chapters_update ON novel_chapters FOR UPDATE
  USING (novel_id IN (SELECT id FROM novels WHERE author_id = auth.uid()));

CREATE POLICY novel_chapters_delete ON novel_chapters FOR DELETE
  USING (novel_id IN (SELECT id FROM novels WHERE author_id = auth.uid()));

-- Bookmarks: private
CREATE POLICY bookmarks_select ON bookmarks FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY bookmarks_insert ON bookmarks FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY bookmarks_delete ON bookmarks FOR DELETE
  USING (user_id = auth.uid());

-- Reading lists: public can read public lists, owner can manage
CREATE POLICY reading_lists_select ON reading_lists FOR SELECT
  USING (is_public = true OR user_id = auth.uid());

CREATE POLICY reading_lists_insert ON reading_lists FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY reading_lists_update ON reading_lists FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY reading_lists_delete ON reading_lists FOR DELETE
  USING (user_id = auth.uid());

-- Reading progress: private
CREATE POLICY reading_progress_select ON reading_progress FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY reading_progress_insert ON reading_progress FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY reading_progress_update ON reading_progress FOR UPDATE
  USING (user_id = auth.uid());

-- Likes: public can read, authenticated can insert/delete own
CREATE POLICY likes_select ON likes FOR SELECT
  USING (true);

CREATE POLICY likes_insert ON likes FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY likes_delete ON likes FOR DELETE
  USING (user_id = auth.uid());

-- Followers: public can read
CREATE POLICY followers_select ON followers FOR SELECT
  USING (true);

CREATE POLICY followers_insert ON followers FOR INSERT
  WITH CHECK (follower_id = auth.uid());

CREATE POLICY followers_delete ON followers FOR DELETE
  USING (follower_id = auth.uid());

-- Reviews: public can read published, owner can manage
CREATE POLICY reviews_select ON reviews FOR SELECT
  USING (status = 'published' OR user_id = auth.uid());

CREATE POLICY reviews_insert ON reviews FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY reviews_update ON reviews FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY reviews_delete ON reviews FOR DELETE
  USING (user_id = auth.uid());

-- Comments: public can read, authenticated can insert, owner can update/delete
CREATE POLICY comments_select ON comments FOR SELECT
  USING (is_deleted = false OR user_id = auth.uid());

CREATE POLICY comments_insert ON comments FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY comments_update ON comments FOR UPDATE
  USING (user_id = auth.uid());

-- Groups: public can read public groups
CREATE POLICY groups_select ON groups FOR SELECT
  USING (privacy = 'public' OR creator_id = auth.uid() OR id IN (
    SELECT group_id FROM group_members WHERE user_id = auth.uid()
  ));

CREATE POLICY groups_insert ON groups FOR INSERT
  WITH CHECK (creator_id = auth.uid());

CREATE POLICY groups_update ON groups FOR UPDATE
  USING (creator_id = auth.uid() OR id IN (
    SELECT group_id FROM group_members WHERE user_id = auth.uid() AND role IN ('admin', 'moderator')
  ));

-- Group members: readable by group members
CREATE POLICY group_members_select ON group_members FOR SELECT
  USING (group_id IN (SELECT id FROM groups WHERE privacy = 'public') OR user_id = auth.uid());

CREATE POLICY group_members_insert ON group_members FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY group_members_delete ON group_members FOR DELETE
  USING (user_id = auth.uid() OR group_id IN (
    SELECT id FROM groups WHERE creator_id = auth.uid()
  ));

-- Group posts: readable by group members
CREATE POLICY group_posts_select ON group_posts FOR SELECT
  USING (group_id IN (SELECT id FROM groups WHERE privacy = 'public') OR author_id = auth.uid());

CREATE POLICY group_posts_insert ON group_posts FOR INSERT
  WITH CHECK (author_id = auth.uid() AND group_id IN (
    SELECT group_id FROM group_members WHERE user_id = auth.uid()
  ));

CREATE POLICY group_posts_update ON group_posts FOR UPDATE
  USING (author_id = auth.uid());

-- Forums: public can read
CREATE POLICY forums_select ON forums FOR SELECT
  USING (true);

CREATE POLICY forum_topics_select ON forum_topics FOR SELECT
  USING (true);

CREATE POLICY forum_topics_insert ON forum_topics FOR INSERT
  WITH CHECK (author_id = auth.uid());

CREATE POLICY forum_topics_update ON forum_topics FOR UPDATE
  USING (author_id = auth.uid());

CREATE POLICY forum_posts_select ON forum_posts FOR SELECT
  USING (true);

CREATE POLICY forum_posts_insert ON forum_posts FOR INSERT
  WITH CHECK (author_id = auth.uid());

CREATE POLICY forum_posts_update ON forum_posts FOR UPDATE
  USING (author_id = auth.uid());

-- Events: public can read
CREATE POLICY events_select ON events FOR SELECT
  USING (true);

CREATE POLICY events_insert ON events FOR INSERT
  WITH CHECK (organizer_id = auth.uid());

CREATE POLICY events_update ON events FOR UPDATE
  USING (organizer_id = auth.uid());

CREATE POLICY event_attendees_select ON event_attendees FOR SELECT
  USING (true);

CREATE POLICY event_attendees_insert ON event_attendees FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY event_attendees_delete ON event_attendees FOR DELETE
  USING (user_id = auth.uid());

-- Notifications: private
CREATE POLICY notifications_select ON notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY notifications_insert ON notifications FOR INSERT
  WITH CHECK (true); -- System can create notifications

CREATE POLICY notifications_update ON notifications FOR UPDATE
  USING (user_id = auth.uid());

-- Reports: private
CREATE POLICY reports_select ON reports FOR SELECT
  USING (reporter_id = auth.uid() OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'administrator'
  ));

CREATE POLICY reports_insert ON reports FOR INSERT
  WITH CHECK (reporter_id = auth.uid());

-- Moderation: admin only
CREATE POLICY moderation_actions_select ON moderation_actions FOR SELECT
  USING (true);

CREATE POLICY moderation_actions_insert ON moderation_actions FOR INSERT
  WITH CHECK (moderator_id IN (SELECT id FROM profiles WHERE role = 'administrator'));

-- Featured & Trending: public can read
CREATE POLICY featured_content_select ON featured_content FOR SELECT
  USING (true);

CREATE POLICY trending_content_select ON trending_content FOR SELECT
  USING (true);

-- Analytics: private
CREATE POLICY analytics_events_select ON analytics_events FOR SELECT
  USING (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'administrator'
  ));

CREATE POLICY analytics_events_insert ON analytics_events FOR INSERT
  WITH CHECK (true); -- System can log events

-- Audit logs: admin only
CREATE POLICY audit_logs_select ON audit_logs FOR SELECT
  USING (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'administrator'
  ));

CREATE POLICY audit_logs_insert ON audit_logs FOR INSERT
  WITH CHECK (true); -- System can log

