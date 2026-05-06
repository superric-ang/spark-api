-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Users (auth handled by Supabase Auth)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,
  birthdate DATE NOT NULL,
  gender VARCHAR(30),
  orientation VARCHAR(30),
  intent VARCHAR(20) DEFAULT 'open', -- casual | serious | open
  match_mode VARCHAR(20) DEFAULT 'blend', -- flow | depth | fate | blend
  flow_weight FLOAT DEFAULT 0.5,
  depth_weight FLOAT DEFAULT 0.5,
  bio_prompts JSONB DEFAULT '[]', -- [{prompt_id, prompt_text, answer}]
  photos JSONB DEFAULT '[]', -- [{url, is_primary, is_verified, order}]
  location GEOGRAPHY(Point, 4326),
  city VARCHAR(100),
  is_verified BOOLEAN DEFAULT FALSE,
  trust_score FLOAT DEFAULT 0.7,
  subscription_tier VARCHAR(20) DEFAULT 'free', -- free | plus | gold
  daily_cards_used INT DEFAULT 0,
  daily_cards_reset_at TIMESTAMP,
  last_active TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Values quiz answers
CREATE TABLE quiz_answers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  question_id INT NOT NULL,
  question_text TEXT NOT NULL,
  answer_value TEXT NOT NULL,
  answer_weight FLOAT, -- numeric representation for scoring
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, question_id)
);

-- User actions (swipes)
CREATE TABLE actions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  actor_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  target_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  action VARCHAR(10) NOT NULL, -- like | pass | superlike
  engine_source VARCHAR(10), -- flow | depth | fate
  scroll_depth FLOAT DEFAULT 0,
  time_spent_ms INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(actor_id, target_id)
);

-- Matches
CREATE TABLE matches (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_a UUID REFERENCES profiles(id) ON DELETE CASCADE,
  user_b UUID REFERENCES profiles(id) ON DELETE CASCADE,
  matched_at TIMESTAMP DEFAULT NOW(),
  compatibility_score FLOAT,
  compatibility_breakdown JSONB, -- {values: 0.8, lifestyle: 0.7, goals: 0.9}
  engine_source VARCHAR(10), -- which engine created this
  conversation_started BOOLEAN DEFAULT FALSE,
  date_planned BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '7 days'),
  UNIQUE(user_a, user_b)
);

-- Messages
CREATE TABLE messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  type VARCHAR(20) DEFAULT 'text', -- text | voice | gif | ai_suggestion
  sent_at TIMESTAMP DEFAULT NOW(),
  read_at TIMESTAMP
);

-- Events
CREATE TABLE events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  location_name VARCHAR(200),
  location GEOGRAPHY(Point, 4326),
  city VARCHAR(100),
  event_date TIMESTAMP NOT NULL,
  price DECIMAL(10,2) DEFAULT 0,
  max_attendees INT DEFAULT 50,
  image_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Event attendees
CREATE TABLE event_attendees (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'going', -- going | maybe | cancelled
  UNIQUE(event_id, user_id)
);

-- Blocks/reports
CREATE TABLE blocks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  blocker_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  blocked_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  reason VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(blocker_id, blocked_id)
);

-- RLS Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Users can only read/update their own profile
CREATE POLICY "Own profile" ON profiles FOR ALL USING (auth.uid() = id);
-- Users can read other profiles (for discovery) — filter in app layer
CREATE POLICY "Read profiles" ON profiles FOR SELECT USING (TRUE);
-- Quiz answers: own only
CREATE POLICY "Own quiz" ON quiz_answers FOR ALL USING (auth.uid() = user_id);
-- Actions: own only
CREATE POLICY "Own actions" ON actions FOR ALL USING (auth.uid() = actor_id);
-- Matches: only parties in the match
CREATE POLICY "Match parties" ON matches FOR SELECT USING (auth.uid() = user_a OR auth.uid() = user_b);
-- Messages: only parties in the match
CREATE POLICY "Message parties" ON messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM matches WHERE id = match_id AND (user_a = auth.uid() OR user_b = auth.uid()))
);
CREATE POLICY "Send messages" ON messages FOR INSERT WITH CHECK (auth.uid() = sender_id);