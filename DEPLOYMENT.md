# 🚀 Dhanuspice - Deployment Guide

Complete guide to deploy Dhanuspice to production.

## Table of Contents
1. [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
2. [Backend Deployment (Render)](#backend-deployment-render)
3. [Database Setup (Firestore)](#database-setup-firestore)
4. [Environment Configuration](#environment-configuration)
5. [Domain Setup](#domain-setup)
6. [Monitoring & Maintenance](#monitoring--maintenance)

---

## Frontend Deployment (Vercel)

### Prerequisites
- GitHub account with repository pushed
- Vercel account (free tier available)
- Environment variables ready

### Steps

1. **Connect GitHub to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign in with GitHub
   - Click "New Project"
   - Select your Dhanuspice repository
   - Click "Import"

2. **Configure Environment Variables**
   - In Vercel dashboard, go to Settings → Environment Variables
   - Add all environment variables from `.env.example`:
     ```
     NEXT_PUBLIC_FIREBASE_API_KEY
     NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
     NEXT_PUBLIC_FIREBASE_PROJECT_ID
     NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
     NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
     NEXT_PUBLIC_FIREBASE_APP_ID
     NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
     NEXT_PUBLIC_RAZORPAY_KEY_ID
     NEXT_PUBLIC_API_URL (point to your backend)
     ```

3. **Deploy**
   - Click "Deploy"
   - Wait for build to complete (5-10 minutes)
   - Your site is now live!

4. **Custom Domain**
   - Settings → Domains
   - Add your custom domain
   - Update DNS records as instructed

### Monitoring
- Monitor real-time logs in Vercel dashboard
- Set up alerts for failed deployments
- Check analytics for performance metrics

---

## Backend Deployment (Render)

### Prerequisites
- Render account (free tier available)
- GitHub repository with `/server` directory
- Environment variables ready
- Node.js backend code

### Steps

1. **Create New Web Service**
   - Go to [render.com](https://render.com)
   - Sign in with GitHub
   - Click "New +" → Web Service
   - Select your Dhanuspice repository

2. **Configure Service**
   - **Name:** dhanuspice-api
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `node server/index.ts`
   - **Root Directory:** (leave empty)

3. **Add Environment Variables**
   - In Render dashboard, go to Environment
   - Add the following:
     ```
     NODE_ENV=production
     PORT=5000
     EMAIL_USER=your_email@gmail.com
     EMAIL_PASSWORD=your_app_password
     EMAIL_SERVICE=gmail
     ADMIN_EMAIL=admin@dhanuspice.com
     JWT_SECRET=your_super_secret_key
     RAZORPAY_KEY_ID=your_razorpay_key
     RAZORPAY_KEY_SECRET=your_razorpay_secret
     ```

4. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment to complete
   - Get your service URL

5. **Update Frontend**
   - In Vercel, update `NEXT_PUBLIC_API_URL` to your Render service URL
   - Redeploy frontend

### Alternative: Railway or Heroku
- Railway: Similar to Render, free tier with $5/month credit
- Heroku: Paid service, but stable and reliable
- AWS EC2: Full control, paid service

---

## Database Setup (Firestore)

### Prerequisites
- Google Cloud Account
- Payment method on file (free tier available)

### Steps

1. **Create Firebase Project**
   - Go to [firebase.google.com](https://firebase.google.com)
   - Click "Go to console"
   - Click "Add project"
   - Name: "dhanuspice"
   - Enable Google Analytics (optional)
   - Create project

2. **Enable Services**
   - **Authentication:**
     - Go to Authentication
     - Click "Sign-in method"
     - Enable: Email/Password, Google, Phone
   
   - **Firestore Database:**
     - Go to Firestore Database
     - Click "Create database"
     - Select region: India (asia-south1)
     - Start in production mode
     - Click "Create"

   - **Storage:**
     - Go to Storage
     - Click "Get started"
     - Accept rules
     - Click "Done"

3. **Create Collections**
   - In Firestore, create these collections:
     ```
     users/
     restaurants/
     foods/
     orders/
     payments/
     reviews/
     addresses/
     coupons/
     ```

4. **Set Security Rules**
   - Go to Firestore → Rules
   - Replace with:
     ```javascript
     rules_version = '2';
     service cloud.firestore {
       match /databases/{database}/documents {
         // Users collection
         match /users/{uid} {
           allow read, write: if request.auth.uid == uid;
         }
         
         // Public collections
         match /restaurants/{document=**} {
           allow read: if true;
           allow write: if request.auth != null && request.auth.token.admin == true;
         }
         
         match /foods/{document=**} {
           allow read: if true;
           allow write: if request.auth != null && request.auth.token.admin == true;
         }
         
         // Orders
         match /orders/{uid} {
           allow read: if request.auth.uid == uid || request.auth.token.admin == true;
           allow write: if request.auth.uid == uid;
         }
       }
     }
     ```
   - Publish

5. **Get Credentials**
   - Project Settings → General
   - Scroll to "Your apps"
   - Click web app icon
   - Copy config
   - Add to `.env.local`

---

## Environment Configuration

### Frontend (.env.local)
```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# API
NEXT_PUBLIC_API_URL=https://dhanuspice-api.onrender.com

# Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_maps_key

# Payments
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key
```

### Backend (.env)
```env
NODE_ENV=production
PORT=5000

# Email
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_SERVICE=gmail
ADMIN_EMAIL=admin@dhanuspice.com

# Security
JWT_SECRET=your_super_secure_secret_key_change_this

# Payment Gateway
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_secret_key
```

---

## Domain Setup

### Purchase Domain
- Namecheap, GoDaddy, or Google Domains
- Example: dhanuspice.com

### Configure DNS
1. **Vercel Domain:**
   - In Vercel dashboard, add domain
   - Update DNS records:
     ```
     Type: CNAME
     Name: www
     Value: cname.vercel-dns.com
     ```
   - Also add root domain with A records

2. **Render Domain:**
   - Get Render URL
   - Keep API on subdomain: api.dhanuspice.com

### SSL Certificate
- Automatic with Vercel and Render
- Usually takes 24-48 hours to propagate

---

## Monitoring & Maintenance

### Performance Monitoring
1. **Vercel Analytics:**
   - Real-time metrics
   - Core Web Vitals
   - Performance tracking

2. **Render Metrics:**
   - CPU usage
   - Memory usage
   - Request logs

### Logging
- Vercel: Check deployment logs
- Render: Check service logs
- Email service: Check sent emails
- Frontend console: Browser dev tools

### Backup Strategy
- Regular Firestore backups
- Enable automatic exports
- Keep local database dumps

### Security Checklist
- ✅ Environment variables secured
- ✅ HTTPS enabled
- ✅ Firestore rules configured
- ✅ API rate limiting enabled
- ✅ Authentication enabled
- ✅ Email notifications working

### Scaling (Future)
- Upgrade Render plan for more resources
- Enable Vercel Enterprise for higher limits
- Consider Firestore scaling for large datasets
- Implement caching layer (Redis)
- Use CDN for static assets

---

## Troubleshooting

### Build Fails on Vercel
- Check Node version (should be 18+)
- Verify all environment variables
- Check for TypeScript errors
- Review build logs

### API Calls Failing
- Check CORS configuration
- Verify API_URL is correct
- Check backend service is running
- Review network tab in browser

### Email Not Sending
- Verify Gmail app password
- Enable 2-factor authentication
- Check email configuration
- Review server logs

### Database Issues
- Check Firestore rules
- Verify authentication
- Check collection names
- Review network requests

---

## Post-Deployment

### Launch Checklist
- [ ] Test authentication (signup, login)
- [ ] Test ordering flow
- [ ] Test payment gateway
- [ ] Verify email notifications
- [ ] Check performance (Lighthouse)
- [ ] Test on mobile devices
- [ ] Verify dark mode
- [ ] Test error handling
- [ ] Check 404 pages
- [ ] Review analytics

### First Week Tasks
- Monitor error rates
- Gather user feedback
- Optimize performance
- Fix critical bugs
- Review logs

### Ongoing Maintenance
- Weekly backups
- Monthly security audits
- Quarterly performance reviews
- Update dependencies
- Monitor analytics

---

## Support & Resources

- [Vercel Docs](https://vercel.com/docs)
- [Render Docs](https://render.com/docs)
- [Firebase Docs](https://firebase.google.com/docs)
- [Next.js Docs](https://nextjs.org/docs)

---

**Last Updated:** January 2024
**Status:** Production Ready
