import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FirebaseAnalytics from "@/components/FirebaseAnalytics";
import AuthSync from "@/components/auth/AuthSync";
import { Toaster } from "react-hot-toast";

const fontSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://dhanuspice.com"),
  title: "Dhanuspice - Luxury & Gourmet Food Delivery",
  description:
    "Order exquisite meals from top Michelin-rated restaurants & gourmet kitchens. Delivered hot in 25 minutes.",
  keywords: [
    "food delivery",
    "gourmet food",
    "luxury dining",
    "biryani delivery",
    "dhanuspice",
  ],
  authors: [{ name: "Dhanuspice" }],
  icons: {
    icon: "/brand/logo-mark.png",
    shortcut: "/brand/logo-mark.png",
    apple: "/brand/logo-mark.png",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://dhanuspice.com",
    title: "Dhanuspice - Luxury & Gourmet Food Delivery",
    description: "Order food from premier restaurants with Dhanuspice",
    images: [
      {
        url: "/brand/logo.png",
        width: 1024,
        height: 1024,
        alt: "Dhanuspice Royal Gourmet Food Delivery",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${fontSans.variable} font-sans bg-[#0B0F17] text-gray-100 min-h-screen selection:bg-amber-500 selection:text-black`}
      >
        <AuthSync />
        <Navbar />
        <main className="min-h-screen relative">{children}</main>
        <Footer />
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#141B28",
              color: "#F3F4F6",
              border: "1px solid rgba(245, 158, 11, 0.2)",
              borderRadius: "1rem",
              boxShadow: "0 20px 30px -10px rgba(0,0,0,0.8)",
            },
          }}
        />
        <FirebaseAnalytics />
      </body>
    </html>
  );
}
