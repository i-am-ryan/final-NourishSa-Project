# Supabase Authentication Setup Guide

## Current Issues

1. Email verification emails are not being sent
2. Authentication is not working properly with the backend
3. User profiles are not being created automatically

## Required Supabase Project Settings

### 1. Enable Email Confirmation

1. Go to your Supabase dashboard: https://supabase.com/dashboard/project/lrvgennjbmmbtpywloem
2. Navigate to **Authentication** → **Settings**
3. Enable **"Enable email confirmations"**
4. Set **"Secure email change"** to enabled
5. Configure **"Site URL"** to your development URL (e.g., `http://localhost:5173`)

### 2. Configure Email Templates

1. Go to **Authentication** → **Email Templates**
2. Customize the **"Confirm signup"** template
3. Make sure the confirmation link points to: `{{ .SiteURL }}/verify-email`

### 3. Database Permissions

1. Go to **Authentication** → **Policies**
2. Ensure the `user_profiles` table has proper RLS policies
3. The trigger function should automatically create user profiles

## Testing the Setup

### 1. Test Authentication

Visit: `http://localhost:5173/auth-test`

This will show you:

- Current authentication status
- Database connection status
- User profile creation status

### 2. Test Email Verification

Visit: `http://localhost:5173/test-email`

This will help you test the email verification flow.

### 3. Test ID Validation

Visit: `http://localhost:5173/test-auth`

This will help you test the ID number validation.

## Expected Flow

1. **User signs up** → Email sent automatically
2. **User clicks verification link** → Redirected to `/verify-email`
3. **Verification processed** → User automatically signed in
4. **User profile created** → Trigger function creates entry in `user_profiles`
5. **User redirected** → Back to the page they came from

## Troubleshooting

### If emails are not being sent:

1. Check Supabase project settings
2. Verify email templates are configured
3. Check spam folder
4. Use the test components to debug

### If user profiles are not created:

1. Check the trigger function is properly set up
2. Verify database permissions
3. Check the migration files are applied

### If authentication fails:

1. Check Supabase URL and API key
2. Verify the user_profiles table exists
3. Test with the auth-test component

## Current Configuration

- **Project ID**: lrvgennjbmmbtpywloem
- **User Table**: user_profiles
- **Auth Table**: auth.users
- **Trigger Function**: handle_new_user()
- **Redirect URL**: /verify-email

## Next Steps

1. Configure Supabase project settings as above
2. Test the authentication flow
3. Verify email verification works
4. Check user profile creation
5. Test the full signup/signin flow
