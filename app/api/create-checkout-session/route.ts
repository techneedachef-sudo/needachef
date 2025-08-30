import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import axios from "axios";
import { getUserIdFromRequest } from "@/app/api/auth/_lib/auth-utils"; // Import the server-side utility

const PAYSTACK_API_URL = "https://api.paystack.co";
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

interface CartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
}

export async function POST(request: NextRequest) {
  const userId = await getUserIdFromRequest(request); // Get userId securely on the server

  if (!userId) {
    return NextResponse.json({ error: "You must be logged in to make a purchase." }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
        where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const { items } = await request.json();

    // Input validation for items
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Invalid cart data: items array is empty or missing." }, { status: 400 });
    }
    for (const item of items) {
        if (!item.id || typeof item.id !== 'string' || !item.name || typeof item.name !== 'string' || !item.price || typeof item.price !== 'number' || item.price <= 0 || !item.quantity || typeof item.quantity !== 'number' || item.quantity <= 0) {
            return NextResponse.json({ error: `Invalid cart item: ${JSON.stringify(item)}` }, { status: 400 });
        }
    }
    
    const total = items.reduce((acc: number, item: CartItem) => acc + item.price * item.quantity, 0);

    // Create a pre-emptive order in our DB
    const order = await prisma.order.create({
        data: {
            userId,
            customerName: user.name,
            customerEmail: user.email,
            total,
            items,
            date: new Date(),
            shippingAddress: {},
        },
    });

    const paystackResponse = await axios.post(
      `${PAYSTACK_API_URL}/transaction/initialize`,
      {
        email: user.email,
        amount: total * 100, // Paystack amount is in kobo/cents
        currency: "NGN",
        metadata: {
          orderId: order.id,
          userId: user.id,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const { reference, access_code } = paystackResponse.data.data;

    return NextResponse.json({ 
        reference, 
        access_code, 
        email: user.email, 
        amount: total 
    });

  } catch (err: unknown) {
    console.error("Error creating Paystack session:", err);
    const error = err as any;
    return NextResponse.json(
      { error: "Failed to initialize payment session.", details: error.response?.data?.message || error.message },
      { status: 500 }
    );
  }
}
