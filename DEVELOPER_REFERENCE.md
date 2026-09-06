# 🎯 Developer's Quick Reference - Dhanuspice

Quick lookup guide for common development tasks.

## 🔧 Common Commands

```bash
# Development
npm run dev              # Start dev server (http://localhost:3000)
npm run dev:all         # Start frontend + backend together

# Production
npm run build           # Build for production
npm run start           # Start production server

# Code Quality
npm run lint            # Run ESLint
npm run type-check      # Check TypeScript errors

# Backend
npm run server          # Start Express server
npm run server:dev      # Start with auto-reload (nodemon)
```

## 📁 Where to Add...

### New Page
Create file: `src/app/your-page/page.tsx`
```typescript
export default function YourPage() {
  return <div>Your page content</div>;
}
```

### New Component
Create file: `src/components/folder/YourComponent.tsx`
```typescript
export default function YourComponent() {
  return <div>Component content</div>;
}
```

### New API Route
Create file: `src/app/api/your-endpoint/route.ts`
```typescript
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  // Your API logic
  return NextResponse.json({ success: true });
}
```

### New Type
Add to: `src/types/index.ts`
```typescript
export interface YourType {
  id: string;
  name: string;
}
```

### New Utility Function
Add to: `src/utils/api.ts` or `src/utils/constants.ts`

## 🎨 Styling

### Add Custom Style
Edit: `src/app/globals.css`

### Change Theme Color
Edit: `tailwind.config.ts`
```typescript
colors: {
  primary: {
    500: "#your-color",
  }
}
```

### Tailwind Classes
```typescript
// Common classes
className="bg-primary-500 text-white px-4 py-2 rounded-lg"
className="flex items-center gap-2"
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
className="dark:bg-gray-800 dark:text-white"
```

## 🔐 Authentication

### Get Current User
```typescript
import { useStore } from "@/store/useStore";

const MyComponent = () => {
  const { user, isAuthenticated } = useStore();
  
  if (!isAuthenticated) return <div>Not logged in</div>;
  return <div>Welcome {user?.displayName}</div>;
};
```

### Protect Route
```typescript
"use client";
import { useStore } from "@/store/useStore";
import { redirect } from "next/navigation";

export default function ProtectedPage() {
  const { isAuthenticated } = useStore();
  
  if (!isAuthenticated) {
    redirect("/login");
  }
  
  return <div>Protected content</div>;
}
```

## 🛒 Shopping Cart

### Add Item to Cart
```typescript
import { useStore } from "@/store/useStore";
import { CartItem } from "@/types";

const { addToCart } = useStore();

const handleAddToCart = (food: any) => {
  const cartItem: CartItem = {
    id: food.id,
    foodId: food.id,
    restaurantId: "1",
    name: food.name,
    image: food.image,
    price: food.price,
    quantity: 1,
  };
  addToCart(cartItem);
};
```

### Get Cart Items
```typescript
const { cartItems, cartTotal, removeFromCart, updateCartItemQuantity } = useStore();

cartItems.forEach(item => {
  console.log(item.name, item.quantity);
});
```

### Clear Cart
```typescript
const { clearCart } = useStore();
clearCart();
```

## 📧 Email Service

### Send Order Email
```typescript
import { sendOrderEmail } from "@/utils/api";

const orderData = {
  customerInfo: {
    name: "John Doe",
    phone: "9876543210",
    email: "john@example.com",
    address: "123 Main St",
    pincode: "600001"
  },
  orderInfo: {
    orderId: "ORD123",
    orderDate: new Date().toLocaleDateString(),
    restaurant: "Restaurant Name",
    paymentMethod: "upi"
  },
  items: cartItems,
  billing: {
    subtotal: 500,
    deliveryCharge: 40,
    gst: 25,
    grandTotal: 565
  }
};

await sendOrderEmail(orderData);
```

## 💳 Payment Gateway

### Create Razorpay Order
```typescript
import { createRazorpayOrder } from "@/utils/api";

const order = await createRazorpayOrder(
  565,                    // amount in INR
  `ORD${Date.now()}`     // receipt
);

console.log(order.order.id);
```

### Verify Payment
```typescript
import { verifyRazorpayPayment } from "@/utils/api";

const result = await verifyRazorpayPayment(
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature
);
```

## 🗄️ Firebase

### Query Firestore
```typescript
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

const getUserOrders = async (userId: string) => {
  const q = query(
    collection(db, "orders"),
    where("userId", "==", userId)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data());
};
```

### Add Document
```typescript
import { db } from "@/lib/firebase";
import { setDoc, doc } from "firebase/firestore";

await setDoc(doc(db, "restaurants", "rest1"), {
  name: "Restaurant Name",
  rating: 4.5,
  // ... other fields
});
```

### Update Document
```typescript
import { updateDoc, doc } from "firebase/firestore";

await updateDoc(doc(db, "orders", orderId), {
  status: "delivered"
});
```

## 🎬 Animations

### Use Framer Motion
```typescript
import { motion } from "framer-motion";

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
  Content
</motion.div>
```

### Stagger Animation
```typescript
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

<motion.div variants={containerVariants}>
  {items.map(item => (
    <motion.div key={item.id} variants={itemVariants}>
      {item.name}
    </motion.div>
  ))}
</motion.div>
```

## 📱 Responsive Design

### Breakpoint Classes
```typescript
// Mobile first
className="text-lg md:text-2xl lg:text-4xl"
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
className="hidden md:block"  // Hide on mobile
className="md:hidden"         // Hide on desktop
```

### Dark Mode
```typescript
className="bg-white dark:bg-gray-800"
className="text-gray-900 dark:text-white"
```

## 🔔 Notifications

### Show Toast
```typescript
import toast from "react-hot-toast";

toast.success("Item added to cart!");
toast.error("Failed to add item");
toast.loading("Loading...");
```

## 🧪 Debugging

### Console Logs
```typescript
console.log("Value:", variable);
console.table(arrayData);
console.error("Error:", error);
```

### TypeScript Checks
```bash
npm run type-check
```

### Browser DevTools
- React DevTools extension
- Network tab for API calls
- Application tab for localStorage

## 🚀 Deployment Checklist

Before deploying:
- [ ] `npm run type-check` passes
- [ ] `npm run lint` passes
- [ ] `npm run build` succeeds
- [ ] All environment variables set
- [ ] Firebase project created
- [ ] Email service configured
- [ ] Payment gateway set up
- [ ] Domain configured

## 📚 File Structure Quick Map

```
Need to change...        → Edit this file
App colors              → tailwind.config.ts
Text/strings            → Component files
Navigation              → components/layout/Navbar.tsx
Order email             → src/app/api/send-order-email/route.ts
API endpoints           → utils/constants.ts
State/data              → store/useStore.ts
Backend logic           → server/index.ts
Database types          → types/index.ts
```

## 🔗 Important URLs

```
Development:    http://localhost:3000
Backend API:    http://localhost:5000
Firebase:       https://firebase.google.com
Vercel:         https://vercel.com
Render:         https://render.com
```

## 🆘 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Module not found | Run `npm install` |
| Port 3000 in use | `PORT=3001 npm run dev` |
| Env vars not loading | Restart dev server |
| TypeScript errors | Run `npm run type-check` |
| Styling not applied | Check Tailwind class names |
| Firebase error | Verify `.env.local` |

## 📖 Key Dependencies

| Package | Use | Docs |
|---------|-----|------|
| next | Framework | nextjs.org |
| react | UI library | react.dev |
| typescript | Type safety | typescriptlang.org |
| tailwindcss | Styling | tailwindcss.com |
| firebase | Backend | firebase.google.com |
| framer-motion | Animations | framer.com/motion |
| zustand | State mgmt | zustand.surge.sh |
| axios | HTTP client | axios-http.com |
| react-hot-toast | Notifications | react-hot-toast.com |

## ⚡ Performance Tips

```typescript
// Use dynamic imports for large components
const HeavyComponent = dynamic(() => import('./Heavy'), {
  loading: () => <div>Loading...</div>,
  ssr: false
});

// Use React.memo to prevent re-renders
const MemoizedComponent = React.memo(MyComponent);

// Use useCallback for event handlers
const handleClick = useCallback(() => {
  // handler code
}, [dependencies]);

// Optimize images
<Image 
  src="/image.jpg" 
  width={400} 
  height={300}
  alt="Description"
/>
```

## 🎓 Learning Resources

- Next.js Docs: https://nextjs.org/docs
- React Docs: https://react.dev
- Tailwind CSS: https://tailwindcss.com/docs
- Firebase: https://firebase.google.com/docs
- TypeScript: https://www.typescriptlang.org/docs/
- Framer Motion: https://www.framer.com/motion/

---

**Pro Tips:**
- Use `Ctrl+Shift+P` (VS Code) to search files/commands
- Use TypeScript strict mode to catch errors early
- Keep components small and focused
- Test on mobile early and often
- Check console for warnings

**Happy Coding! 🚀**
