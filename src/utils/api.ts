// Utility functions for API calls

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// Order API
export async function sendOrderEmail(orderData: any) {
  try {
    const response = await fetch("/api/send-order-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      throw new Error("Failed to send order email");
    }

    return await response.json();
  } catch (error) {
    console.error("Error sending order email:", error);
    throw error;
  }
}

// Razorpay Payment
export async function createRazorpayOrder(amount: number, receipt: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/create-razorpay-order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ amount, currency: "INR", receipt }),
    });

    if (!response.ok) {
      throw new Error("Failed to create order");
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    throw error;
  }
}

export async function verifyRazorpayPayment(
  razorpay_order_id: string,
  razorpay_payment_id: string,
  razorpay_signature: string
) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/verify-razorpay-payment`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          razorpay_order_id,
          razorpay_payment_id,
          razorpay_signature,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Payment verification failed");
    }

    return await response.json();
  } catch (error) {
    console.error("Error verifying payment:", error);
    throw error;
  }
}

// Utility function to format currency
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
  }).format(amount);
}

// Utility function to format date
export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return new Intl.DateTimeFormat("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

// Validation functions
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePhone(phone: string): boolean {
  const phoneRegex = /^[0-9]{10}$/;
  return phoneRegex.test(phone);
}

export function validatePincode(pincode: string): boolean {
  const pincodeRegex = /^[0-9]{6}$/;
  return pincodeRegex.test(pincode);
}

// Truncate text
export function truncateText(text: string, length: number): string {
  return text.length > length ? text.substring(0, length) + "..." : text;
}

// Calculate GST
export function calculateGST(amount: number, gstRate: number = 5): number {
  return Math.round((amount * gstRate) / 100);
}

// Generate Order ID
export function generateOrderId(): string {
  return `ORD${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
}
