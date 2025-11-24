/*
  # Fix Leaderboard Public Access

  1. Changes
    - Allow anonymous users to view leaderboard
    - Keep insert restricted to authenticated users only
    - Update function security to allow public execution
  
  2. Security
    - Read access is now public (anyone can see scores)
    - Write access remains authenticated only
*/

-- Drop existing SELECT policy
DROP POLICY IF EXISTS "Anyone can view leaderboard" ON challenge_leaderboard;

-- Create new public SELECT policy
CREATE POLICY "Public can view leaderboard"
  ON challenge_leaderboard
  FOR SELECT
  TO public
  USING (true);

-- Update function to be accessible by public
DROP FUNCTION IF EXISTS get_daily_leaderboard(text, integer);

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

-- Grant execute permission to public
GRANT EXECUTE ON FUNCTION get_daily_leaderboard TO public;
GRANT EXECUTE ON FUNCTION get_daily_leaderboard TO anon;