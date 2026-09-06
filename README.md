# 🍛 Dhanuspice - Food Delivery Platform

A production-ready, full-stack food delivery platform similar to Swiggy, built with modern technologies and best practices.

## 📋 Tech Stack

### Frontend
- **Next.js 15** - React framework with server-side rendering
- **React 19** - Latest React features
- **TypeScript** - Type safety and developer experience
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations
- **Zustand** - State management
- **React Query** - Data fetching and caching
- **React Hot Toast** - Toast notifications
- **React Icons** - Icon library

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **Firebase Auth** - Authentication
- **Firestore** - NoSQL database
- **Firebase Storage** - File storage
- **Nodemailer** - Email service
- **Razorpay** - Payment gateway

### DevOps & Tools
- **Vercel** - Frontend deployment
- **Render/Railway** - Backend deployment
- **GitHub** - Version control
- **ESLint & Prettier** - Code quality

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Firebase project
- Razorpay account
- Gmail/Email service for notifications

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd dhanuspice
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
```

Fill in your environment variables:
```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key

# Payment Gateway
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret

# Email Service
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_SERVICE=gmail

# Admin
ADMIN_EMAIL=admin@dhanuspice.com
```

4. **Run development server**
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
dhanuspice/
├── src/
│   ├── app/                 # Next.js pages and layouts
│   │   ├── api/            # API routes
│   │   ├── login/          # Login page
│   │   ├── signup/         # Signup page
│   │   ├── cart/           # Shopping cart
│   │   ├── checkout/       # Checkout page
│   │   ├── order-tracking/ # Order tracking
│   │   ├── layout.tsx      # Root layout
│   │   ├── page.tsx        # Home page
│   │   └── globals.css     # Global styles
│   ├── components/
│   │   ├── layout/         # Navbar, Footer
│   │   ├── home/           # Home page components
│   │   └── common/         # Reusable components
│   ├── lib/               # Utilities and firebase config
│   ├── hooks/             # Custom React hooks
│   ├── store/             # Zustand store
│   ├── types/             # TypeScript types
│   └── utils/             # Helper functions
├── server/                # Express backend
│   └── index.ts           # Main server file
├── public/                # Static assets
├── package.json           # Dependencies
├── tsconfig.json          # TypeScript config
├── tailwind.config.ts     # Tailwind config
├── next.config.ts         # Next.js config
└── README.md             # This file
```

## 🔐 Authentication

### Firebase Setup
1. Create a Firebase project at [firebase.google.com](https://firebase.google.com)
2. Enable Authentication (Email/Password & Google)
3. Enable Firestore Database
4. Enable Storage
5. Copy credentials to `.env.local`

### Login Methods
- Email & Password
- Google OAuth
- Phone number (coming soon)

## 💳 Payment Gateway

### Razorpay Integration
1. Sign up at [razorpay.com](https://razorpay.com)
2. Get API keys from dashboard
3. Add keys to `.env.local`

### Supported Payment Methods
- Cash on Delivery
- UPI
- Credit Card
- Debit Card
- Net Banking
- Wallet

## 📧 Email System

### Order Confirmation Emails
Automated emails sent to customers containing:
- Order ID and date
- Customer details
- Delivery address
- Items ordered
- Billing summary
- Estimated delivery time

### Setup
1. Enable 2-Step Verification on Gmail
2. Create App Password
3. Add to `EMAIL_PASSWORD` in `.env.local`

## 🗄️ Database Schema

### Firestore Collections

#### Users
```json
{
  "uid": "string",
  "email": "string",
  "displayName": "string",
  "phone": "string",
  "addresses": [],
  "savedRestaurants": [],
  "createdAt": "timestamp"
}
```

#### Restaurants
```json
{
  "id": "string",
  "name": "string",
  "image": "string",
  "rating": "number",
  "cuisines": ["string"],
  "coordinates": {"lat": "number", "lng": "number"},
  "isOpen": "boolean"
}
```

#### Foods
```json
{
  "id": "string",
  "restaurantId": "string",
  "name": "string",
  "price": "number",
  "category": "string",
  "vegetarian": "boolean",
  "image": "string"
}
```

#### Orders
```json
{
  "id": "string",
  "userId": "string",
  "items": [],
  "totalAmount": "number",
  "status": "string",
  "paymentStatus": "string",
  "deliveryAddress": "object",
  "createdAt": "timestamp"
}
```

## 🎨 Design Features

### Color Scheme
- **Primary**: Orange (#ff9f00)
- **Secondary**: Gray
- **Success**: Green
- **Error**: Red

### UI Components
- Glassmorphism effects
- Smooth animations with Framer Motion
- Loading skeletons
- Toast notifications
- Responsive grid layouts

### Dark Mode
- Automatic theme detection
- Manual theme toggle
- Tailwind CSS dark mode support

## 📱 Mobile Responsiveness

- Mobile-first design approach
- Responsive breakpoints:
  - sm: 640px
  - md: 768px
  - lg: 1024px
  - xl: 1280px

## 🚀 Deployment

### Frontend (Vercel)
```bash
# Push to GitHub
git push origin main

# Auto-deployed by Vercel
```

### Backend (Render/Railway)
1. Create account on Render or Railway
2. Connect GitHub repository
3. Set environment variables
4. Deploy

### Environment Variables for Production
```env
NEXT_PUBLIC_API_URL=https://your-backend-url.com
NODE_ENV=production
```

## 📊 Performance

Target Lighthouse Scores:
- Performance: 95+
- Accessibility: 90+
- Best Practices: 95+
- SEO: 100

Optimization Techniques:
- Image lazy loading
- Code splitting
- Caching strategies
- Compression
- CDN usage

## 🔒 Security

- JWT authentication
- HTTPS only
- CORS protection
- Rate limiting
- Input validation
- XSS prevention
- CSRF protection
- Secure headers with Helmet

## 📚 API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/signup` - Register
- `POST /api/auth/logout` - Logout

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders/:id` - Get order details
- `GET /api/orders` - User's orders
- `POST /api/send-order-email` - Send order confirmation

### Payments
- `POST /api/create-razorpay-order` - Create payment order
- `POST /api/verify-razorpay-payment` - Verify payment

## 🛠️ Development

### Code Style
- ESLint configuration for JavaScript/TypeScript
- Prettier for code formatting
- Husky for pre-commit hooks

### Testing
```bash
npm run lint
npm run type-check
```

## 📦 Build & Deploy

```bash
# Build for production
npm run build

# Start production server
npm run start

# Run development server
npm run dev

# Run both frontend and backend
npm run dev:all
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📖 Documentation

- [Firebase Docs](https://firebase.google.com/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Razorpay Docs](https://razorpay.com/docs)

## 🐛 Known Issues & TODOs

- [ ] Complete admin panel implementation
- [ ] Real-time WebSocket integration for live tracking
- [ ] Advanced search with filters
- [ ] User reviews and ratings system
- [ ] Promotion and discount management
- [ ] Analytics dashboard
- [ ] Multi-language support
- [ ] PWA support

## 📞 Support

For support, email support@dhanuspice.com or create an issue in the repository.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Author

Dhanuspice Team

## 🙏 Acknowledgments

- Inspired by Swiggy's design and user experience
- Built with modern web technologies
- Community contributions welcome

---

**Made with ❤️ by Dhanuspice Team**
