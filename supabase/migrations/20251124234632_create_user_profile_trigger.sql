/*
  # Auto-create user profiles on signup

  1. Changes
    - Creates a function to automatically create user_profiles when a new user signs up
    - Creates a trigger on auth.users to call this function
    - Ensures every authenticated user has a profile row for leaderboard functionality

  2. Security
    - Function runs with security definer privileges to bypass RLS
    - Only creates profile if it doesn't exist
*/

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, created_at, last_active)
  VALUES (
    NEW.id,
    NEW.email,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();