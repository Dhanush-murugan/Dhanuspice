# 🚀 Quick Start Guide - Dhanuspice

Get Dhanuspice up and running in less than 10 minutes!

## Prerequisites
- Node.js 18+ ([Download](https://nodejs.org/))
- npm or yarn
- Git
- A code editor (VS Code recommended)

## Step 1: Clone & Install (2 minutes)

```bash
# Clone the repository
git clone <your-repo-url>
cd dhanuspice

# Install dependencies
npm install
```

## Step 2: Set Up Environment (3 minutes)

### Copy Environment Template
```bash
cp .env.example .env.local
```

### Add Firebase Credentials
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use existing
3. Copy your Web Config
4. Update `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=<your_api_key>
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=<your_auth_domain>
NEXT_PUBLIC_FIREBASE_PROJECT_ID=<your_project_id>
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=<your_storage_bucket>
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=<your_sender_id>
NEXT_PUBLIC_FIREBASE_APP_ID=<your_app_id>
```

### Add Google Maps Key (Optional)
1. Create API key at [Google Cloud Console](https://console.cloud.google.com/)
2. Add to `.env.local`:
```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=<your_maps_key>
```

### Add Email Service (For Order Emails)
1. Enable 2-Step Verification on Gmail
2. Create App Password
3. Add to `.env.local`:
```env
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=<your_app_password>
```

## Step 3: Run Development Server (1 minute)

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser! 🎉

## What You Can Do

### Sign Up & Login
- Create a new account or use Google Login
- Your data is stored in Firebase

### Browse & Order (Demo)
- View restaurants and food items
- Add items to cart
- Proceed to checkout
- Enter delivery address
- Select payment method
- Place order (email will be sent)

### Order Tracking
- Order confirmation page
- Live status updates
- Estimated delivery time
- Rider information

### Admin Dashboard
- Navigate to `/admin`
- View statistics
- Manage orders
- Add restaurants/foods

## Useful Commands

```bash
# Development
npm run dev              # Start dev server
npm run dev:all         # Frontend + Backend

# Production
npm run build           # Build for production
npm run start           # Start production server

# Code Quality
npm run lint            # Run ESLint
npm run type-check      # TypeScript checks

# Backend Only
npm run server          # Start Express server
npm run server:dev      # Start with nodemon
```

## Project Structure Overview

```
dhanuspice/
├── src/
│   ├── app/              # Next.js pages
│   ├── components/       # React components
│   ├── lib/             # Firebase config
│   ├── store/           # State management
│   └── utils/           # Helper functions
├── server/              # Express backend
├── public/              # Static files
└── README.md            # Full documentation
```

## File Changes You Might Make

### Add New Page
Create `src/app/new-page/page.tsx`

### Add New Component
Create `src/components/my-component/MyComponent.tsx`

### Update Styles
Edit `src/app/globals.css`

### Change Colors
Edit `tailwind.config.ts`

## Common Issues & Solutions

### Issue: "Cannot find module 'firebase'"
**Solution**: Run `npm install`

### Issue: Environment variables not loading
**Solution**: Restart dev server with `npm run dev`

### Issue: Firebase authentication errors
**Solution**: Check Firebase credentials in `.env.local`

### Issue: Email not sending
**Solution**: 
1. Enable 2FA on Gmail
2. Create App Password (not regular password)
3. Use App Password in EMAIL_PASSWORD

### Issue: Port 3000 already in use
**Solution**: 
```bash
# Change port
PORT=3001 npm run dev

# Or kill process using port 3000
# macOS/Linux: lsof -i :3000 | kill -9 <PID>
# Windows: netstat -ano | findstr :3000
```

## Next Steps

1. **Customize**
   - Change app name
   - Update colors
   - Modify text & images

2. **Add Data**
   - Add restaurants to Firestore
   - Add food items
   - Set up coupons

3. **Deploy**
   - Follow [DEPLOYMENT.md](./DEPLOYMENT.md)
   - Deploy to Vercel (frontend)
   - Deploy to Render (backend)

4. **Extend**
   - Add more features
   - Implement payment gateway
   - Set up analytics

## Resources

- 📖 [Full Documentation](./README.md)
- 🚀 [Deployment Guide](./DEPLOYMENT.md)
- ✨ [Features & Roadmap](./FEATURES.md)
- 🔧 [Next.js Docs](https://nextjs.org/docs)
- 🔥 [Firebase Docs](https://firebase.google.com/docs)
- 🎨 [Tailwind CSS](https://tailwindcss.com/docs)

## Getting Help

1. Check the [README.md](./README.md) for detailed info
2. Review code comments
3. Check TypeScript errors
4. Look at console logs

## Development Tips

### Use TypeScript
- Catch errors early
- Better IDE support
- Auto-completion

### Use React DevTools
- Install React DevTools extension
- Debug component state
- Check props

### Use Next.js DevTools
- Performance insights
- Build analysis
- Error tracking

### Use Tailwind CSS IntelliSense
- VS Code extension
- Auto-complete classes
- Color preview

## Time Estimates for Features

| Feature | Time |
|---------|------|
| Setup | 5 min |
| Browse & Order | 2 min |
| Email Verification | 1 min |
| Admin Panel | 2 min |
| Order Tracking | 2 min |

**Total Time**: ~10 minutes to see full demo!

## What's Included

✅ **Complete Frontend**
- Home page with hero, search, categories
- Authentication (email + Google)
- Restaurant browsing
- Shopping cart
- Checkout with multiple payment options
- Order tracking with live updates
- Admin dashboard

✅ **Complete Backend**
- Express server with email service
- Payment gateway integration
- Rate limiting & security
- Error handling

✅ **Database Structure**
- Firebase Firestore setup
- Security rules configured
- Collections ready to use

✅ **Documentation**
- Setup guide
- Deployment instructions
- Features list
- Code structure

## Customization Ideas

1. **Change Theme**
   - Edit `tailwind.config.ts`
   - Update primary color from orange to your brand

2. **Add Your Logo**
   - Replace 🍛 emoji with your logo
   - Update public assets

3. **Modify Copy**
   - Change app name "Dhanuspice" to your name
   - Update descriptions and messages

4. **Add Features**
   - Implement real payment
   - Add live tracking with maps
   - Enable reviews & ratings

## Performance

Current Lighthouse Scores (Target):
- Performance: 95+
- Accessibility: 90+
- Best Practices: 95+
- SEO: 100

Check your scores:
```bash
npm run build  # Build optimized version
npm run start  # Start production server
# Then run Lighthouse audit in Chrome
```

## Version Info

- **Next.js**: 15.0.0
- **React**: 19.0.0
- **TypeScript**: 5.3.0
- **Tailwind**: 3.4.0
- **Node.js**: 18+

## License

MIT - Feel free to use for personal or commercial projects

---

**Happy Coding! 🚀**

Questions? Check the full [README.md](./README.md)
