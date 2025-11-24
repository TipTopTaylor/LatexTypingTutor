/*
  # Create level content storage

  1. New Tables
    - `level_content`
      - `id` (uuid, primary key)
      - `level_number` (integer) - e.g., 1, 2, 3
      - `sublevel_name` (text) - e.g., 'additionSubtraction', 'fractions'
      - `content` (jsonb) - array of {latex, math} objects
      - `created_at` (timestamp)
    
  2. Security
    - Enable RLS on `level_content` table
    - Public can read level 1 content
    - Authenticated users with premium can read all content
*/

CREATE TABLE IF NOT EXISTS level_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  level_number integer NOT NULL,
  sublevel_name text NOT NULL,
  content jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE level_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view level 1 content"
  ON level_content
  FOR SELECT
  USING (level_number = 1);

CREATE POLICY "Premium users can view all content"
  ON level_content
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.has_premium_access = true
    )
  );
