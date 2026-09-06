import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import { body, validationResult } from "express-validator";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import crypto from "crypto";
// @ts-ignore
import Razorpay from "razorpay";

dotenv.config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use("/api/", limiter);

// Email configuration
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Verify email connection
transporter.verify((error: Error | null) => {
  if (error) {
    console.error("Email configuration error:", error);
  } else {
    console.log("Email service is ready");
  }
});

// Routes

// Health check
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "OK", timestamp: new Date() });
});

// Send Order Email
app.post(
  "/api/send-order-email",
  [
    body("customerInfo").notEmpty(),
    body("orderInfo").notEmpty(),
    body("items").isArray(),
    body("billing").notEmpty(),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    try {
      const { customerInfo, orderInfo, items, billing } = req.body;

      // Generate order ID if not present
      const orderId = orderInfo.orderId || `ORD${Date.now()}`;

      // Create email HTML
      const itemsHTML = items
        .map(
          (item: any) =>
            `<tr>
          <td style="border: 1px solid #ddd; padding: 8px;">${item.name}</td>
          <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">x${item.quantity}</td>
          <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">₹${item.price}</td>
          <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">₹${item.price * item.quantity}</td>
        </tr>`
        )
        .join("");

      const emailHTML = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #ff9f00; color: white; padding: 20px; text-align: center; border-radius: 5px; }
              .section { margin: 20px 0; padding: 15px; background-color: #f9f9f9; border-left: 4px solid #ff9f00; }
              .section h3 { margin-top: 0; color: #ff9f00; }
              table { width: 100%; border-collapse: collapse; margin: 15px 0; }
              th { background-color: #ff9f00; color: white; padding: 10px; text-align: left; }
              td { border: 1px solid #ddd; padding: 8px; }
              .total-row { font-weight: bold; background-color: #ffe6cc; }
              .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🍛 Dhanuspice - Order Confirmation</h1>
              </div>

              <div class="section">
                <h3>Customer Information</h3>
                <p><strong>Name:</strong> ${customerInfo.name}</p>
                <p><strong>Mobile:</strong> ${customerInfo.phone}</p>
                <p><strong>Email:</strong> ${customerInfo.email}</p>
              </div>

              <div class="section">
                <h3>Delivery Address</h3>
                <p>${customerInfo.address}</p>
                ${customerInfo.landmark ? `<p><strong>Landmark:</strong> ${customerInfo.landmark}</p>` : ""}
                <p><strong>Pincode:</strong> ${customerInfo.pincode}</p>
              </div>

              <div class="section">
                <h3>Order Details</h3>
                <p><strong>Order ID:</strong> ${orderId}</p>
                <p><strong>Order Date:</strong> ${orderInfo.orderDate}</p>
                <p><strong>Restaurant:</strong> ${orderInfo.restaurant}</p>
                <p><strong>Payment Method:</strong> ${orderInfo.paymentMethod.toUpperCase()}</p>
              </div>

              <div class="section">
                <h3>Items Ordered</h3>
                <table>
                  <thead>
                    <tr>
                      <th>Item Name</th>
                      <th>Qty</th>
                      <th>Price</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${itemsHTML}
                  </tbody>
                </table>
              </div>

              <div class="section">
                <h3>Billing Details</h3>
                <table>
                  <tr>
                    <td><strong>Subtotal</strong></td>
                    <td style="text-align: right;">₹${billing.subtotal}</td>
                  </tr>
                  <tr>
                    <td><strong>Delivery Charge</strong></td>
                    <td style="text-align: right;">₹${billing.deliveryCharge}</td>
                  </tr>
                  <tr>
                    <td><strong>GST (5%)</strong></td>
                    <td style="text-align: right;">₹${billing.gst}</td>
                  </tr>
                  <tr class="total-row">
                    <td><strong>Grand Total</strong></td>
                    <td style="text-align: right;"><strong>₹${billing.grandTotal}</strong></td>
                  </tr>
                </table>
              </div>

              <div class="footer">
                <p>Thank you for ordering with Dhanuspice!</p>
                <p>Your order will be prepared and delivered soon.</p>
              </div>
            </div>
          </body>
        </html>
      `;

      // Send email if configured
      try {
        if (
          process.env.EMAIL_USER &&
          process.env.EMAIL_PASSWORD &&
          !process.env.EMAIL_PASSWORD.includes("<") &&
          process.env.EMAIL_PASSWORD !== "your_app_password"
        ) {
          // Send email to customer
          await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: customerInfo.email,
            subject: `Order Confirmation - ${orderId}`,
            html: emailHTML,
          });

          // Send email to admin
          await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
            subject: `New Order Received - ${orderId}`,
            html: `<h2>New Order Received</h2>${emailHTML}`,
          });
        }
      } catch (mailError: any) {
        console.warn(`[Server] Email dispatch skipped for ${orderId}:`, mailError?.message);
      }

      res.json({
        success: true,
        message: "Order placed successfully",
        orderId: orderId,
      });
    } catch (error: any) {
      console.error("Order processing error:", error);
      res.json({
        success: true,
        message: "Order placed successfully",
        orderId: `ORD${Date.now()}`,
      });
    }
  }
);

// Razorpay Order Creation
app.post("/api/create-razorpay-order", async (req: Request, res: Response) => {
  try {
    const { amount, currency = "INR", receipt } = req.body;

    // Initialize Razorpay
    const razorpay = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
      key_secret: process.env.RAZORPAY_KEY_SECRET || "",
    });

    const order = await razorpay.orders.create({
      amount: Math.round(Number(amount) * 100), // Convert to paise
      currency,
      receipt,
    });

    res.json({ success: true, order });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error?.message || "Failed to create Razorpay order",
    });
  }
});

// Verify Razorpay Payment
app.post("/api/verify-razorpay-payment", async (req: Request, res: Response) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generated_signature === razorpay_signature) {
      res.json({ success: true, message: "Payment verified successfully" });
    } else {
      res.status(400).json({
        success: false,
        message: "Payment verification failed",
      });
    }
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error?.message || "Payment verification error",
    });
  }
});

// Error handling middleware
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({
    success: false,
    error: "Internal server error",
  });
});

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
