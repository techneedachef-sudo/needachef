import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import axios from "axios";
import { getUserIdFromRequest } from "@/app/api/auth/_lib/auth-utils";

const PAYSTACK_API_URL = "https://api.paystack.co";
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

export async function POST(request: NextRequest) {
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { reference } = await request.json();
    if (!reference) {
        return NextResponse.json({ error: "Payment reference is required." }, { status: 400 });
    }

    try {
        const booking = await prisma.booking.findFirst({
            where: { paymentReference: reference, userId },
            include: { user: true },
        });

        if (!booking) {
            return NextResponse.json({ error: "Booking not found." }, { status: 404 });
        }

        if (booking.paymentStatus === 'PAID') {
            return NextResponse.json({ error: "This booking has already been paid for." }, { status: 400 });
        }

        const paystackResponse = await axios.post(
            `${PAYSTACK_API_URL}/transaction/initialize`,
            {
                email: booking.user.email,
                amount: (booking.paymentAmount || 0) * 100,
                currency: "NGN",
                metadata: {
                    bookingId: booking.id,
                    userId: booking.userId,
                },
            }
        );

        const { authorization_url, reference: newReference, access_code } = paystackResponse.data.data;

        await prisma.booking.update({
            where: { id: booking.id },
            data: { paymentReference: newReference },
        });

        return NextResponse.json({
            authorization_url,
            reference: newReference,
            access_code,
            email: booking.user.email,
            amount: booking.paymentAmount,
        });

    } catch (error: any) {
        console.error("Error re-initializing payment:", error);
        return NextResponse.json({ error: "Failed to re-initialize payment.", details: error.response?.data?.message || error.message }, { status: 500 });
    }
}
