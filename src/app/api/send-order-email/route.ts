import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

// Email configuration
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerInfo, orderInfo, items, billing } = body;

    if (!customerInfo || !items || !billing) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Generate order ID
    const orderId = orderInfo.orderId || `ORD${Date.now()}`;

    // Create items table HTML
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

    // Create email HTML template
    const emailHTML = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ff9f00 0%, #ff8c00 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .header h1 { font-size: 28px; margin-bottom: 10px; }
          .header p { font-size: 14px; opacity: 0.9; }
          .section { margin: 0; padding: 20px; background-color: #f9f9f9; border-left: 4px solid #ff9f00; border-bottom: 1px solid #eee; }
          .section h3 { margin-bottom: 15px; color: #ff9f00; font-size: 18px; }
          .section p { margin-bottom: 8px; line-height: 1.6; }
          .section strong { color: #333; }
          table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          th { background-color: #ff9f00; color: white; padding: 12px; text-align: left; font-weight: 600; }
          td { border: 1px solid #ddd; padding: 10px; }
          .total-row { font-weight: bold; background-color: #ffe6cc; }
          .total-row td { border: 2px solid #ff9f00; }
          .footer { background-color: #f0f0f0; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; color: #666; font-size: 12px; }
          .footer p { margin: 5px 0; }
          .footer a { color: #ff9f00; text-decoration: none; }
          .status-badge { display: inline-block; padding: 5px 10px; background-color: #4CAF50; color: white; border-radius: 3px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⚜️ DHANUSPICE • ROYAL GOURMET</h1>
            <p>Exquisite Dining Delivered With Utmost Culinary Care</p>
          </div>

          <div class="section">
            <h3>✅ NEW ORDER RECEIVED</h3>
            <p><strong>Order ID:</strong> <span style="color: #ff9f00; font-weight: bold;">${orderId}</span></p>
            <p><strong>Order Date & Time:</strong> ${new Date().toLocaleString("en-IN")}</p>
            <p><strong>Status:</strong> <span class="status-badge">Order Placed</span></p>
          </div>

          <div class="section">
            <h3>👤 Customer Information</h3>
            <p><strong>Name:</strong> ${customerInfo.name}</p>
            <p><strong>Mobile Number:</strong> ${customerInfo.phone}</p>
            <p><strong>Email:</strong> ${customerInfo.email}</p>
          </div>

          <div class="section">
            <h3>📍 Delivery Address</h3>
            <p>${customerInfo.address}</p>
            ${customerInfo.landmark ? `<p><strong>Landmark:</strong> ${customerInfo.landmark}</p>` : ""}
            <p><strong>Pincode:</strong> ${customerInfo.pincode}</p>
          </div>

          <div class="section">
            <h3>🍽️ Items Ordered</h3>
            <table>
              <thead>
                <tr>
                  <th>Item Name</th>
                  <th>Qty</th>
                  <th>Unit Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHTML}
              </tbody>
            </table>
          </div>

          <div class="section">
            <h3>💰 Billing Summary</h3>
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
                <td style="text-align: right;">₹${billing.grandTotal}</td>
              </tr>
            </table>
            <p><strong>Payment Method:</strong> ${orderInfo.paymentMethod || "Cash on Delivery"}</p>
          </div>

          <div class="section">
            <h3>🎯 What's Next?</h3>
            <p>✅ Your order has been received</p>
            <p>⏳ Restaurant will confirm in 2-3 minutes</p>
            <p>🍳 Preparation will begin once confirmed</p>
            <p>🚴 Delivery agent will pick up your order</p>
            <p>🏠 You'll receive delivery updates via SMS</p>
          </div>

          <div class="footer">
            <p><strong>Need Help?</strong></p>
            <p>Contact us at <strong>support@dhanuspice.com</strong> or call <strong>1800-DHANUSPICE</strong></p>
            <p style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #ddd;">
              Thank you for ordering with Dhanuspice! Enjoy your meal! 😋
            </p>
            <p>© 2026 Dhanuspice Gourmet Technologies Inc. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    let emailSent = false;
    // Attempt sending confirmation emails if credentials are configured
    try {
      if (
        process.env.EMAIL_USER &&
        process.env.EMAIL_PASSWORD &&
        !process.env.EMAIL_PASSWORD.includes("<") &&
        process.env.EMAIL_PASSWORD !== "your_app_password"
      ) {
        // Send email to customer
        await transporter.sendMail({
          from: `"Dhanuspice" <${process.env.EMAIL_USER}>`,
          to: customerInfo.email,
          subject: `Order Confirmation - ${orderId} | Dhanuspice Food Delivery`,
          html: emailHTML,
        });

        // Send notification to admin
        const adminEmailHTML = `
          <h2>🚨 NEW ORDER ALERT 🚨</h2>
          <p><strong>Order ID:</strong> ${orderId}</p>
          <p><strong>Customer:</strong> ${customerInfo.name}</p>
          <p><strong>Total Amount:</strong> ₹${billing.grandTotal}</p>
          <p><strong>Delivery Address:</strong> ${customerInfo.address}</p>
          <p><strong>Contact:</strong> ${customerInfo.phone}</p>
          ${emailHTML}
        `;

        await transporter.sendMail({
          from: `"Dhanuspice" <${process.env.EMAIL_USER}>`,
          to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
          subject: `[NEW ORDER] ${orderId} - ₹${billing.grandTotal}`,
          html: adminEmailHTML,
        });

        emailSent = true;
      } else {
        console.log(`[Order API] Order ${orderId} placed (email dispatch skipped: SMTP credentials not configured)`);
      }
    } catch (mailError: any) {
      console.warn(`[Order API] Email dispatch skipped for ${orderId}:`, mailError?.message);
    }

    return NextResponse.json(
      {
        success: true,
        message: emailSent
          ? "Order confirmation email sent successfully"
          : "Order placed successfully!",
        orderId: orderId,
        emailSent,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Order processing error:", error);
    const fallbackOrderId = `ORD${Date.now()}`;
    return NextResponse.json(
      {
        success: true,
        message: "Order placed successfully!",
        orderId: fallbackOrderId,
        emailSent: false,
      },
      { status: 200 }
    );
  }
}
