import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { getUserIdFromRequest } from "@/app/api/auth/_lib/auth-utils";

export async function GET(request: NextRequest) {
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const ref = searchParams.get('ref');

    if (!ref) {
        return NextResponse.json({ error: "Payment reference is required." }, { status: 400 });
    }

    try {
        const booking = await prisma.booking.findFirst({
            where: {
                paymentReference: ref,
                userId: userId,
            },
        });

        if (!booking) {
            return NextResponse.json({ error: "Booking not found." }, { status: 404 });
        }

        return NextResponse.json(booking);

    } catch (error) {
        console.error("Error fetching booking details:", error);
        return NextResponse.json({ error: "Failed to fetch booking details." }, { status: 500 });
    }
}
