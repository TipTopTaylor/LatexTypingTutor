/*
  # Fix RLS Infinite Recursion

  1. Changes
    - Drop the problematic admin policy that causes infinite recursion
    - Keep only the simple user policies
    
  2. Security
    - Users can still view their own profile
    - Admins can use service role if needed
*/

-- Drop the problematic policy
DROP POLICY IF EXISTS "University admins can view their institution users" ON user_profiles;
