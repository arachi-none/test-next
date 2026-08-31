-- NovelSpace Database Migration 1.0
-- Profiles, Roles, Users

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- PROFILES & ROLES
-- =====================================================

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(50) UNIQUE NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  avatar_url TEXT,
  cover_image_url TEXT,
  bio TEXT,
  website TEXT,
  social_links JSONB DEFAULT '{}',
  favorite_genres UUID[] DEFAULT '{}',
  role VARCHAR(20) DEFAULT 'reader' CHECK (role IN ('reader', 'writer', 'administrator')),
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ROLES & PERMISSIONS
-- =====================================================

CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  permissions JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES profiles(id),
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, role_id)
);

-- =====================================================
-- WRITER PROFILES
-- =====================================================

CREATE TABLE IF NOT EXISTS writer_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  pen_name VARCHAR(100),
  about_the_author TEXT,
  writing_since DATE,
  total_novels INTEGER DEFAULT 0,
  total_chapters INTEGER DEFAULT 0,
  total_views BIGINT DEFAULT 0,
  total_bookmarks BIGINT DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  avg_rating DECIMAL(3,2) DEFAULT 0,
  followers_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- READER PROFILES
-- =====================================================

CREATE TABLE IF NOT EXISTS reader_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  reading_preferences JSONB DEFAULT '{}',
  total_reads INTEGER DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  total_bookmarks INTEGER DEFAULT 0,
  total_comments INTEGER DEFAULT 0,
  reading_streak INTEGER DEFAULT 0,
  last_read_at TIMESTAMPTZ,
  followers_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- GENRES & TAGS
-- =====================================================

CREATE TABLE IF NOT EXISTS genres (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) UNIQUE NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  color VARCHAR(7),
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) UNIQUE NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- AGE RATINGS
-- =====================================================

CREATE TABLE IF NOT EXISTS age_ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) UNIQUE NOT NULL,
  slug VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  min_age INTEGER,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_role_id ON user_roles(role_id);
CREATE INDEX idx_genres_slug ON genres(slug);
CREATE INDEX idx_tags_slug ON tags(slug);
CREATE INDEX idx_writer_profiles_featured ON writer_profiles(featured);

-- =====================================================
-- TRIGGER: Auto-update updated_at
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_writer_profiles_updated_at BEFORE UPDATE ON writer_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reader_profiles_updated_at BEFORE UPDATE ON reader_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SEED DATA: Roles
-- =====================================================

INSERT INTO roles (name, description, permissions) VALUES
  ('reader', 'Default reader role', '{"can_read": true, "can_review": true, "can_comment": true}'),
  ('writer', 'Can publish novels', '{"can_read": true, "can_review": true, "can_comment": true, "can_publish": true, "can_edit_own": true}'),
  ('administrator', 'Full platform access', '{"can_read": true, "can_review": true, "can_comment": true, "can_publish": true, "can_edit_own": true, "can_edit_all": true, "can_moderate": true, "can_manage_users": true}')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- SEED DATA: Age Ratings
-- =====================================================

INSERT INTO age_ratings (name, slug, description, min_age, sort_order) VALUES
  ('General', 'general', 'Suitable for all ages', 0, 1),
  ('Teen', 'teen', 'Suitable for ages 13+', 13, 2),
  ('Mature', 'mature', 'Suitable for ages 17+', 17, 3),
  ('Adult', 'adult', 'Suitable for ages 18+', 18, 4)
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- SEED DATA: Genres
-- =====================================================

INSERT INTO genres (name, slug, description, color, sort_order) VALUES
  ('Fantasy', 'fantasy', 'Magical worlds and adventures', '#6B46C1', 1),
  ('Romance', 'romance', 'Love stories and relationships', '#EC4899', 2),
  ('Sci-Fi', 'sci-fi', 'Science fiction and futuristic worlds', '#3B82F6', 3),
  ('Horror', 'horror', 'Spine-chilling tales of terror', '#1F2937', 4),
  ('Mystery', 'mystery', 'Puzzles, crimes, and investigations', '#059669', 5),
  ('Thriller', 'thriller', 'High-stakes suspense and action', '#DC2626', 6),
  ('Adventure', 'adventure', 'Epic journeys and quests', '#F59E0B', 7),
  ('Slice of Life', 'slice-of-life', 'Everyday stories and realism', '#10B981', 8),
  ('Comedy', 'comedy', 'Humor and lighthearted tales', '#F97316', 9),
  ('Drama', 'drama', 'Emotional and character-driven stories', '#8B5CF6', 10),
  ('Historical', 'historical', 'Stories set in the past', '#92400E', 11),
  ('Fanfiction', 'fanfiction', 'Stories based on existing works', '#6366F1', 12)
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE writer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE reader_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read own, public can read basic
CREATE POLICY profiles_select ON profiles FOR SELECT
  USING (true); -- Public can see profiles (adjust as needed)

CREATE POLICY profiles_update ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Writer profiles: public can read, owner can update
CREATE POLICY writer_profiles_select ON writer_profiles FOR SELECT
  USING (true);

CREATE POLICY writer_profiles_update ON writer_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Reader profiles: private
CREATE POLICY reader_profiles_select ON reader_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY reader_profiles_update ON reader_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Roles: readable by all
CREATE POLICY roles_select ON roles FOR SELECT
  USING (true);

-- User roles: readable by all
CREATE POLICY user_roles_select ON user_roles FOR SELECT
  USING (true);

