/*
  # Daily Challenge Leaderboard System

  1. New Tables
    - `challenge_leaderboard`
      - `id` (uuid, primary key) - Unique identifier for each entry
      - `user_id` (uuid, foreign key to auth.users) - User who completed the challenge
      - `challenge_level` (text) - Challenge identifier (e.g., 'challenge1', 'challenge2')
      - `completion_time_seconds` (integer) - Time taken to complete in seconds
      - `completed_at` (timestamptz) - When the challenge was completed (for daily partitioning)
      - `display_name` (text) - User's display name (cached for performance)
      - `created_at` (timestamptz) - Record creation timestamp
    
    - `user_profiles` (updated)
      - Add `display_name` (text) - Optional display name for leaderboard
      - Add `show_on_leaderboard` (boolean) - Privacy opt-out flag
  
  2. Security
    - Enable RLS on `challenge_leaderboard` table
    - Users can insert their own scores
    - All authenticated users can read leaderboard entries
    - Users cannot modify or delete existing entries
    
  3. Indexes
    - Composite index on (challenge_level, completed_at) for fast daily queries
    - Index on user_id for user-specific queries
  
  4. Functions
    - `get_daily_leaderboard(challenge_level_param, limit_param)` - Get top scores for today
*/

-- Create challenge_leaderboard table
CREATE TABLE IF NOT EXISTS challenge_leaderboard (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_level text NOT NULL,
  completion_time_seconds integer NOT NULL CHECK (completion_time_seconds > 0),
  completed_at timestamptz NOT NULL DEFAULT now(),
  display_name text NOT NULL DEFAULT 'Anonymous',
  created_at timestamptz DEFAULT now()
);

-- Add display name and privacy settings to user_profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'display_name'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN display_name text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'show_on_leaderboard'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN show_on_leaderboard boolean DEFAULT true;
  END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_leaderboard_challenge_date 
  ON challenge_leaderboard(challenge_level, completed_at DESC);

CREATE INDEX IF NOT EXISTS idx_leaderboard_user 
  ON challenge_leaderboard(user_id);

-- Enable RLS
ALTER TABLE challenge_leaderboard ENABLE ROW LEVEL SECURITY;

-- RLS Policies for challenge_leaderboard

-- Users can insert their own scores
CREATE POLICY "Users can insert own scores"
  ON challenge_leaderboard
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- All authenticated users can view leaderboard entries
CREATE POLICY "Anyone can view leaderboard"
  ON challenge_leaderboard
  FOR SELECT
  TO authenticated
  USING (true);

-- Function to get daily top 10 for a specific challenge
CREATE OR REPLACE FUNCTION get_daily_leaderboard(
  challenge_level_param text,
  limit_param integer DEFAULT 10
)
RETURNS TABLE (
  rank bigint,
  user_id uuid,
  display_name text,
  completion_time_seconds integer,
  completed_at timestamptz
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ROW_NUMBER() OVER (ORDER BY cl.completion_time_seconds ASC) as rank,
    cl.user_id,
    cl.display_name,
    cl.completion_time_seconds,
    cl.completed_at
  FROM challenge_leaderboard cl
  WHERE cl.challenge_level = challenge_level_param
    AND cl.completed_at >= CURRENT_DATE
    AND cl.completed_at < CURRENT_DATE + INTERVAL '1 day'
  ORDER BY cl.completion_time_seconds ASC
  LIMIT limit_param;
END;
$$;

-- Grant execute permission on function
GRANT EXECUTE ON FUNCTION get_daily_leaderboard TO authenticated;