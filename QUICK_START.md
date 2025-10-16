# Email Verification - Quick Start Guide

## ✅ What's Done

Email verification is **fully implemented** and ready to use! Users must now verify their email before logging in.

---

## 🚀 Quick Setup (5 Minutes)

### Step 1: Configure Email Settings

Add these lines to your `backend/.env` file:

```env
# Email Settings
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USERNAME=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@artisansalley.com
EMAIL_USE_TLS=true

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

### Step 2: Get Gmail App Password (if using Gmail)

1. Go to: https://myaccount.google.com/security
2. Enable 2-Factor Authentication
3. Click "App passwords"
4. Create password for "Mail"
5. Copy the 16-character password
6. Use it as `EMAIL_PASSWORD` in `.env`

### Step 3: Start the Application

**Backend:**
```bash
cd backend
source venv/bin/activate
python run.py
```

**Frontend:**
```bash
cd frontend
npm run dev
```

---

## 🧪 Test It Out

1. **Open**: http://localhost:5173/signup
2. **Register** a new user with your email
3. **Check** your email inbox for verification link
4. **Click** the verification link
5. **Try** logging in - it should work now!

---

## 📋 What Happens Now

### When Users Sign Up:
1. Account created (unverified)
2. Verification email sent automatically
3. Success message displayed
4. User redirected to login

### When Users Try to Login (Unverified):
1. Login blocked with error message
2. Link to resend verification shown
3. User must verify email first

### When Users Verify Email:
1. Account activated
2. Welcome email sent
3. Can now log in successfully

---

## 📄 New Pages Available

- `/verify-email` - Email verification page
- `/resend-verification` - Resend verification email

---

## 🆘 Quick Troubleshooting

**Emails not sending?**
- Check `.env` file has correct credentials
- For Gmail, use App Password (not regular password)
- Try testing with Mailtrap.io for development

**Token expired?**
- Tokens last 24 hours
- Use "Resend Verification" to get new one

**Still can't login after verifying?**
- Check database: user's `is_verified` should be `true`
- Clear browser cache and try again

---

## 📚 Full Documentation

For detailed information, see:
- `EMAIL_VERIFICATION_COMPLETE.md` - Complete implementation guide
- `backend/EMAIL_VERIFICATION_SETUP.md` - Detailed setup instructions
- `backend/EMAIL_VERIFICATION_SUMMARY.md` - Technical summary

---

## 🎯 What's Next?

You're all set! The email verification system is working. Consider these enhancements:

- Use professional email service (SendGrid, Mailgun) for production
- Add password reset via email
- Implement two-factor authentication
- Add email notifications for orders

---

## 💡 Tips

1. **Development**: Use Mailtrap.io to test emails without sending real ones
2. **Production**: Use SendGrid or Mailgun for reliability
3. **Testing**: Create test accounts to verify the flow works correctly

---

**Status**: ✅ Ready to Use!

**Need Help?** Check the troubleshooting section in `EMAIL_VERIFICATION_COMPLETE.md`

