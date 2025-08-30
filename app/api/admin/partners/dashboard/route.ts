import { NextRequest, NextResponse } from "next/server";
import { USER_COOKIE_NAME } from "@/utils/constants";
import prisma from "@/app/lib/prisma";
import { getJwtPayload } from "@/app/api/auth/_lib/auth-utils";

export async function GET(request: NextRequest) {
    const token = request.cookies.get(USER_COOKIE_NAME)?.value;
    if (!token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const payload = await getJwtPayload(token);
        if (!payload || !payload.userId) {
            return NextResponse.json({ error: "Invalid token" }, { status: 401 });
        }

        const bookings = await prisma.booking.findMany({
            where: {
                user: {
                    id: payload.userId,
                },
            },
        });

        const inquiries = await prisma.inquiry.findMany({
            where: {
                partnerId: payload.userId,
            },
        });

        const bookingReferrals = bookings.map(b => ({
            id: b.id,
            type: 'Booking',
            date: b.date,
            referredFrom: b.ref,
            commission: 50.00, // Example commission
            status: b.status,
        }));

        const inquiryReferrals = inquiries.map(i => ({
            id: i.id,
            type: 'Inquiry',
            date: i.createdAt,
            referredFrom: i.ref,
            commission: 0.00,
            status: i.status,
        }));

        const referralData = [...bookingReferrals, ...inquiryReferrals];

        return NextResponse.json(referralData);

    } catch (error) {
        console.error("Get Partner Dashboard Data Error:", error);
        return NextResponse.json({ error: "An internal server error occurred" }, { status: 500 });
    }
}
