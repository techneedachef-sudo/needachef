import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/app/lib/prisma";
import { Resend } from "resend";
import { render } from "@react-email/render";
import OrderConfirmationEmail from "@/components/emails/OrderConfirmationEmail";
import BookingConfirmationEmail from "@/components/emails/BookingConfirmationEmail";

const resend = new Resend(process.env.RESEND_API_KEY);
const paystackSecret = process.env.PAYSTACK_SECRET_KEY!;

async function sendOrderConfirmation(orderId: string) {
    const order = await prisma.order.findUnique({
        where: { id: orderId },
    });
    if (!order) {
        console.error(`Order ${orderId} not found for sending confirmation.`);
        return;
    }

    if (!process.env.RESEND_API_KEY) {
        console.log("RESEND_API_KEY not set. Simulating email sending.");
        return;
    }

    try {
        const emailHtml = await render(
            OrderConfirmationEmail({
                orderId: order.id,
                orderDate: new Date(order.date).toLocaleDateString(),
                customerName: order.customerName,
                items: order.items as any[],
                total: order.total,
            })
        );

        await resend.emails.send({
            from: process.env.SENDER_EMAIL || "onboarding@resend.dev",
            to: order.customerEmail,
            subject: `Your NeedAChef Order Confirmation #${order.id}`,
            html: emailHtml,
        });

        console.log(`Order confirmation email sent to ${order.customerEmail}`);
    } catch (error) {
        console.error(`Failed to send email for order ${orderId}:`, error);
    }
}

async function sendBookingConfirmation(bookingId: string) {
    const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: { user: true, service: true },
    });
    if (!booking) {
        console.error(`Booking ${bookingId} not found for sending confirmation.`);
        return;
    }

    if (!process.env.RESEND_API_KEY) {
        console.log("RESEND_API_KEY not set. Simulating email sending.");
        return;
    }

    try {
        const emailHtml = await render(
            BookingConfirmationEmail({
                bookingId: booking.id,
                bookingDate: new Date(booking.date).toLocaleDateString(),
                customerName: booking.user.name,
                serviceName: booking.service?.name || 'N/A',
                amount: booking.paymentAmount || 0,
            })
        );

        await resend.emails.send({
            from: process.env.SENDER_EMAIL || "onboarding@resend.dev",
            to: booking.user.email,
            subject: `Your NeedAChef Booking Confirmation #${booking.id}`,
            html: emailHtml,
        });

        console.log(`Booking confirmation email sent to ${booking.user.email}`);
    } catch (error) {
        console.error(`Failed to send email for booking ${bookingId}:`, error);
    }
}

async function assignChefToBooking(bookingId: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  try {
    const response = await fetch(`${baseUrl}/api/admin/bookings/${bookingId}/assign-chef`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.WEBHOOK_SECRET_KEY}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to assign chef");
    }

    console.log(`Successfully triggered chef assignment for booking ${bookingId}`);
  } catch (error) {
    console.error(`Error in assignChefToBooking for booking ${bookingId}:`, error);
  }
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("x-paystack-signature") as string;

  const hash = crypto
    .createHmac("sha512", paystackSecret)
    .update(body)
    .digest("hex");

  if (hash !== signature) {
    console.error("Paystack webhook signature verification failed.");
    return NextResponse.json({ error: "Webhook signature verification failed." }, { status: 401 });
  }

  const event = JSON.parse(body);

  if (event.event === 'charge.success') {
    const { reference, metadata, amount } = event.data;
    const orderId = metadata?.orderId;
    const bookingId = metadata?.bookingId;

    if (orderId) {
      console.log(`Payment successful for order: ${orderId} with reference: ${reference}`);
      const order = await prisma.order.update({
          where: { id: orderId },
          data: { status: "PAID" },
      });
      
      if (order) {
          for (const item of order.items as any[]) {
              await prisma.product.update({
                  where: { id: item.id },
                  data: {
                      stock: {
                          decrement: item.quantity,
                      },
                  },
              });
          }
      }
      
      await sendOrderConfirmation(orderId);

    } else if (bookingId) {
        console.log(`Payment successful for booking: ${bookingId} with reference: ${reference}`);
        await prisma.booking.update({
            where: { id: bookingId },
            data: { 
                paymentStatus: "PAID",
                status: "PENDING", // Keep it pending until a chef is assigned
                transactionId: reference,
                paymentAmount: amount / 100, // Convert from kobo/cents
            },
        });
        
        // Asynchronously assign chef without blocking the webhook response
        assignChefToBooking(bookingId).catch(error => {
            console.error(`Failed to trigger chef assignment for booking ${bookingId}:`, error);
        });

        await sendBookingConfirmation(bookingId);
    } else {
      console.error("Webhook received a session without an orderId or bookingId in metadata.");
    }
  }

  return NextResponse.json({ received: true });
}
