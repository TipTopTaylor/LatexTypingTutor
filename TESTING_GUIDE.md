# Testing Guide

## Quick Test Steps

### 1. Test Free Content (No Login Required)
1. Open the app
2. Click "Tutorial Mode" - should work without login
3. Click "Learning Mode" → "Level 1" - should work
4. Click "Learning Mode" → "Level 2" - should work

### 2. Test Paywall (Login Required)
1. Try to access "Level 3" or higher
2. Should see alert: "Sign in with your university email to access premium levels"
3. Try "Challenge Mode" - should prompt for login
4. Try "Endless Mode" - should prompt for login

### 3. Test Sign Up
1. Click a premium level to trigger auth screen
2. Click "Sign up"
3. Try with an approved domain:
   - Use: `student@demo.edu` (100 seats available)
   - Or: `student@test.edu` (50 seats available)
   - Password: anything 6+ characters
4. Should successfully create account and grant access

### 4. Test Invalid Domain
1. Try signing up with: `user@gmail.com`
2. Should see error: "Your email domain is not authorized..."

### 5. Test Seat Limits
To test seat limit enforcement:
1. In Supabase, update a license to have 0 remaining seats:
```sql
UPDATE university_licenses
SET used_seats = total_seats
WHERE email_domain = 'demo.edu';
```
2. Try signing up with `newuser@demo.edu`
3. Should see: "Seat limit reached for Demo University..."

### 6. Test Sign In
1. Sign out if logged in
2. Click a premium level
3. Enter previously created credentials
4. Should successfully sign in and access content

### 7. Test Admin Dashboard
1. Make a user an admin:
```sql
UPDATE user_profiles
SET is_university_admin = true
WHERE email = 'student@demo.edu';
```
2. Sign in as that user
3. "Admin Dashboard" button should appear on home screen
4. Click it to view:
   - University stats
   - Seat usage
   - Active users list

### 8. Test User Info Display
When logged in:
- Top-right should show email and "Premium Access" status
- "Sign Out" button should be visible
- After signing out, these should disappear

## Adding Test Universities

To add your own test university:

```sql
INSERT INTO university_licenses (
  university_name,
  email_domain,
  total_seats,
  is_active,
  expires_at
)
VALUES (
  'My Test University',
  'mytest.edu',
  10,
  true,
  now() + interval '1 year'
);
```

Then test with `user@mytest.edu`

## Checking Database State

### View all licenses:
```sql
SELECT university_name, email_domain, used_seats, total_seats
FROM university_licenses;
```

### View all users:
```sql
SELECT email, university_domain, has_premium_access, is_university_admin
FROM user_profiles;
```

### View user progress:
```sql
SELECT up.email, upr.level_id, upr.completed, upr.score
FROM user_progress upr
JOIN user_profiles up ON upr.user_id = up.id;
```

## Common Issues

### "Missing Supabase environment variables"
- Check `.env` file exists and has correct values
- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_SUPABASE_ANON_KEY` are set

### User can't access premium content after signup
- Check `has_premium_access` in `user_profiles` table
- Should be `true` for users with valid licenses

### Admin dashboard not showing
- Verify `is_university_admin = true` for the user
- Check that user has a valid `license_id`

### Seat count not updating
- Check that triggers are active in database
- Manually verify: `SELECT used_seats FROM university_licenses WHERE email_domain = 'demo.edu'`
