# LaTeX Typing Tutor - Deployment Guide

## Overview
This application now includes a complete university licensing system with authentication, paywall enforcement, and admin dashboards.

## Features Implemented

### 1. Authentication System
- Email/password authentication via Supabase
- University domain verification
- Automatic seat management
- Session management and tracking

### 2. Paywall System
- **Free Access**: Tutorial Mode, Level 1, Level 2
- **Premium Access**: Level 3+, Challenge Mode, Endless Mode
- Automatic enforcement based on user authentication

### 3. University Licensing
- Self-service student registration with university emails
- Automatic domain whitelisting
- Seat-based licensing (e.g., 500 seats per university)
- Real-time seat counting

### 4. Admin Dashboard
- University admins can view:
  - Total seats and usage
  - Active users list
  - User activity tracking
  - License expiration dates

## Database Setup

The database has been configured with:
- `university_licenses` - Stores university license information
- `user_profiles` - User accounts linked to Supabase auth
- `user_progress` - Tracks user progress through levels
- Row Level Security (RLS) for data protection
- Automatic seat counting via triggers

### Sample Universities Added
- Demo University (demo.edu) - 100 seats
- Test College (test.edu) - 50 seats

## Adding New Universities

To add a new university license, run this SQL in your Supabase dashboard:

```sql
INSERT INTO university_licenses (
  university_name,
  email_domain,
  total_seats,
  is_active,
  expires_at
)
VALUES (
  'University Name',
  'university.edu',
  500,
  true,
  now() + interval '1 year'
);
```

## How It Works

### For Students:
1. Visit the site
2. Click a premium level/mode
3. Get prompted to sign in
4. Sign up with university email (e.g., student@umich.edu)
5. System automatically:
   - Validates email domain against approved universities
   - Checks seat availability
   - Creates account with premium access
   - Increments seat count

### For Universities:
1. You approve their domain and set seat limit
2. Students self-register with no codes needed
3. Admin users can view dashboard showing:
   - Seat usage
   - Active users
   - User activity

### Making Someone a University Admin:
```sql
UPDATE user_profiles
SET is_university_admin = true
WHERE email = 'admin@university.edu';
```

## Environment Variables

The `.env` file contains:
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_SUPABASE_ANON_KEY` - Supabase anonymous key

## Deployment Steps

1. **Deploy Database**:
   - Already configured in your Supabase project
   - Migrations applied automatically

2. **Configure Universities**:
   - Add university licenses via SQL (see above)
   - Set seat limits based on contracts

3. **Deploy Frontend**:
   - Upload all files to your hosting provider
   - Ensure `.env` is configured (or set environment variables in hosting platform)
   - No build step required (static site)

4. **Test Flow**:
   - Try signing up with a whitelisted domain
   - Verify paywall blocks premium content for non-authenticated users
   - Check admin dashboard functionality

## Managing Licenses

### View All Licenses:
```sql
SELECT * FROM university_licenses;
```

### Update Seat Count:
```sql
UPDATE university_licenses
SET total_seats = 1000
WHERE email_domain = 'university.edu';
```

### Deactivate License:
```sql
UPDATE university_licenses
SET is_active = false
WHERE email_domain = 'university.edu';
```

### View Users for a University:
```sql
SELECT up.email, up.created_at, up.last_active, ul.university_name
FROM user_profiles up
JOIN university_licenses ul ON up.license_id = ul.id
WHERE ul.email_domain = 'university.edu'
ORDER BY up.created_at DESC;
```

## Security Features

- Row Level Security (RLS) on all tables
- Users can only access their own data
- Admins can only view their institution's data
- Domain validation on signup
- Seat limit enforcement
- Session-based authentication

## Pricing Model

This system supports:
- Seat-based licensing (pay per user)
- Annual renewals (expires_at field)
- Unlimited domains/universities
- Self-service for students (no manual provisioning)

## Support & Troubleshooting

### "Your email domain is not authorized"
- The student's email domain is not in the `university_licenses` table
- Add the university or have the student use their university email

### "Seat limit reached"
- The university has reached their seat limit
- Increase `total_seats` or remove inactive users

### Admin dashboard not showing
- User needs `is_university_admin = true` in their profile
- Update via SQL query above

## Future Enhancements

Consider adding:
- Bulk user import/export
- Usage analytics
- Email notifications for seat limits
- Grace period for graduated students
- Multi-tier pricing (different features per tier)
