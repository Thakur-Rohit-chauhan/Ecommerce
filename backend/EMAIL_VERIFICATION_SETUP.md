# Email Verification Setup Guide

This guide explains the email verification system that has been implemented for user registration.

## Overview

When users register on Artisans Alley, they must verify their email address before they can log in. This ensures that:
- Users provide valid email addresses
- Account security is enhanced
- We can communicate with users via email

## Features Implemented

1. **Email Verification on Signup**: New users automatically receive a verification email
2. **Token-based Verification**: Secure, time-limited tokens (24-hour expiry)
3. **Resend Verification Email**: Users can request a new verification email
4. **Login Protection**: Unverified users cannot log in until email is verified
5. **Welcome Email**: Users receive a welcome email after successful verification

## API Endpoints

### 1. Register (POST /auth/register)
- Creates a new user account
- Automatically sends verification email
- User is created with `is_verified = False`

**Request Body:**
```json
{
  "email": "user@example.com",
  "username": "johndoe",
  "full_name": "John Doe",
  "password": "securepassword123",
  "phone_number": "+1234567890",
  "address": "123 Main St"
}
```

**Response:**
```json
{
  "message": "User created successfully",
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "johndoe",
    "is_verified": false,
    ...
  }
}
```

### 2. Verify Email (POST /auth/verify-email)
- Verifies user's email with the token sent via email
- Marks user as verified
- Sends welcome email

**Request Body:**
```json
{
  "token": "verification-token-from-email"
}
```

**Response:**
```json
{
  "message": "Email verified successfully",
  "data": {
    "user_id": "uuid",
    "email": "user@example.com"
  }
}
```

### 3. Resend Verification (POST /auth/resend-verification)
- Resends verification email to user
- Invalidates previous tokens
- Creates new verification token

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "message": "Verification email sent successfully",
  "data": {
    "email": "user@example.com"
  }
}
```

### 4. Login (POST /auth/login)
- Modified to check email verification status
- Returns 403 error if email not verified

**Error Response (Unverified):**
```json
{
  "detail": "Please verify your email address before logging in. Check your email for the verification link."
}
```

## Email Configuration

### Environment Variables

Add these to your `.env` file:

```env
# Email Settings
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USERNAME=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@artisansalley.com
EMAIL_USE_TLS=true

# Frontend URL (for verification links)
FRONTEND_URL=http://localhost:5173
```

### Using Gmail SMTP

If using Gmail:
1. Enable 2-Factor Authentication on your Google account
2. Generate an App Password:
   - Go to Google Account settings
   - Security > 2-Step Verification > App passwords
   - Create a new app password for "Mail"
3. Use the generated password as `EMAIL_PASSWORD`

### Using Other Email Providers

**SendGrid:**
```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USERNAME=apikey
EMAIL_PASSWORD=your-sendgrid-api-key
EMAIL_USE_TLS=true
```

**Mailgun:**
```env
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
EMAIL_USERNAME=postmaster@your-domain.mailgun.org
EMAIL_PASSWORD=your-mailgun-password
EMAIL_USE_TLS=true
```

**AWS SES:**
```env
EMAIL_HOST=email-smtp.us-east-1.amazonaws.com
EMAIL_PORT=587
EMAIL_USERNAME=your-ses-smtp-username
EMAIL_PASSWORD=your-ses-smtp-password
EMAIL_USE_TLS=true
```

## Database Schema

### EmailVerificationToken Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Foreign key to users table |
| token | String(255) | Verification token (unique) |
| expires_at | Timestamp | Token expiration time |
| is_used | Boolean | Whether token has been used |
| created_at | Timestamp | Token creation time |

### User Model Changes

The `User` model already had the `is_verified` field. The signup flow now:
1. Sets `is_verified = False` for new users
2. Creates a verification token
3. Sends verification email

## Frontend Integration

### 1. Signup Flow

```javascript
// Register user
const response = await fetch('/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    username: 'johndoe',
    full_name: 'John Doe',
    password: 'password123'
  })
});

// Show message: "Please check your email to verify your account"
```

### 2. Email Verification Page

Create a page at `/verify-email` that:
- Extracts token from URL query parameter
- Calls the verify endpoint
- Shows success/error message

```javascript
// In VerifyEmail.jsx
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token');

const response = await fetch('/auth/verify-email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ token })
});

if (response.ok) {
  // Show success message and redirect to login
} else {
  // Show error message
}
```

### 3. Resend Verification

```javascript
// On a "Resend Verification Email" page or button
const response = await fetch('/auth/resend-verification', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'user@example.com' })
});

// Show message: "Verification email sent"
```

### 4. Login Error Handling

```javascript
const response = await fetch('/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username, password })
});

if (response.status === 403) {
  // Email not verified
  // Show message and link to resend verification
} else if (response.status === 401) {
  // Invalid credentials
}
```

## Testing

### 1. Test Email Sending (Optional)

For development, you can use a test email service like Mailtrap:

```env
EMAIL_HOST=smtp.mailtrap.io
EMAIL_PORT=2525
EMAIL_USERNAME=your-mailtrap-username
EMAIL_PASSWORD=your-mailtrap-password
EMAIL_USE_TLS=true
```

### 2. Manual Testing Steps

1. **Register a new user**
   - POST to `/auth/register`
   - Check email for verification link
   - Verify `is_verified = false` in database

2. **Try to login before verification**
   - POST to `/auth/login`
   - Should receive 403 error

3. **Verify email**
   - Click link in email or POST to `/auth/verify-email`
   - Check `is_verified = true` in database
   - Verify welcome email received

4. **Login after verification**
   - POST to `/auth/login`
   - Should succeed and return token

5. **Resend verification**
   - POST to `/auth/resend-verification`
   - Check email for new verification link
   - Verify old token is invalidated

## Security Considerations

1. **Token Expiry**: Tokens expire after 24 hours
2. **Single Use**: Tokens can only be used once
3. **Unique Tokens**: Each token is a UUID, making it impossible to guess
4. **HTTPS**: Always use HTTPS in production to protect tokens in transit
5. **Rate Limiting**: Consider adding rate limiting to prevent abuse

## Troubleshooting

### Email Not Sending

1. Check environment variables are set correctly
2. Verify SMTP credentials are valid
3. Check firewall/network settings allow SMTP connections
4. Enable debug logging in email service
5. Test with a different email provider

### Token Expired

- Tokens expire after 24 hours
- User should request a new verification email
- Use the resend verification endpoint

### Already Verified

- If user tries to verify again, they'll get an error
- This is expected behavior
- User can proceed to login

## Production Recommendations

1. **Use a Transactional Email Service**: SendGrid, Mailgun, AWS SES
2. **Set up SPF/DKIM Records**: Improves email deliverability
3. **Monitor Email Sending**: Track delivery rates and failures
4. **Add Rate Limiting**: Prevent spam and abuse
5. **Queue Email Sending**: Use Celery or similar for async email sending
6. **Use HTTPS**: Protect verification tokens in transit
7. **Custom Email Templates**: Brand your verification emails
8. **Analytics**: Track verification rates and user flow

## File Structure

```
backend/
├── src/
│   ├── auth/
│   │   ├── user/
│   │   │   ├── models.py          # User model (is_verified field)
│   │   │   ├── service.py         # User service (verification methods)
│   │   │   ├── schema.py          # Verification schemas
│   │   │   └── routes.py          # User routes
│   │   ├── routes.py              # Auth routes (verify endpoints)
│   │   └── verification_models.py # EmailVerificationToken model
│   ├── common/
│   │   └── email_service.py       # Email sending service
│   └── config.py                  # Email configuration
└── alembic/
    └── versions/
        └── 31cddfe913a0_*.py      # Email verification migration
```

## Support

If you encounter any issues, please check:
1. Database migration is applied
2. Environment variables are set correctly
3. Email credentials are valid
4. Network allows SMTP connections

For further assistance, consult the API documentation or contact the development team.

