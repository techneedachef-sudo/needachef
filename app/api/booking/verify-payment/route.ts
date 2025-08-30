import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import axios from "axios";

const PAYSTACK_API_URL = "https://api.paystack.co";
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const ref = searchParams.get('ref');

    if (!ref) {
        return NextResponse.json({ error: "Payment reference is required." }, { status: 400 });
    }

    try {
        const paystackResponse = await axios.get(
            `${PAYSTACK_API_URL}/transaction/verify/${ref}`,
            {
                headers: {
                    Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
                },
            }
        );

        const { status, data } = paystackResponse.data;

        if (status && data.status === 'success') {
            const bookingId = data.metadata?.bookingId;
            if (bookingId) {
                await prisma.booking.update({
                    where: { id: bookingId },
                    data: {
                        paymentStatus: 'PAID',
                        status: 'CONFIRMED',
                        transactionId: data.id.toString(),
                    },
                });
            }
            return NextResponse.json({ status: 'success' });
        } else {
            const bookingId = data.metadata?.bookingId;
            if (bookingId) {
                await prisma.booking.update({
                    where: { id: bookingId },
                    data: {
                        paymentStatus: 'FAILED',
                    },
                });
            }
            return NextResponse.json({ status: 'failed' });
        }
    } catch (error: any) {
        console.error("Paystack verification error:", error);
        return NextResponse.json({ error: "Failed to verify payment.", details: error.response?.data?.message || error.message }, { status: 500 });
    }
}
