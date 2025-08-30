import { NextRequest, NextResponse } from "next/server";
import { getJwtPayload } from "@/app/api/auth/_lib/auth-utils";
import prisma from "@/app/lib/prisma";
import { USER_COOKIE_NAME } from "@/utils/constants";

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
        const userId = payload.userId as string;

        const bookings = await prisma.booking.findMany({
            where: { userId: payload.userId as string },
            orderBy: { createdAt: 'desc' },
            include: {
                service: { select: { name: true } },
                chef: { select: { name: true, profilePicture: true } },
            }
        });
        return NextResponse.json(bookings);

    } catch (error) {
        console.error("Get Bookings Error:", error);
        return NextResponse.json({ error: "An internal server error occurred" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const token = request.cookies.get(USER_COOKIE_NAME)?.value;
        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const payload = await getJwtPayload(token);
        if (!payload || !payload.userId) {
            return NextResponse.json({ error: "Invalid token" }, { status: 401 });
        }
        const userId = payload.userId as string;

        const bookingData = await request.json();

        const { selectedService, ...restBookingData } = bookingData;

        if (!selectedService || !selectedService.id) {
            return NextResponse.json({ error: "Service ID is missing" }, { status: 400 });
        }
        
        const newBooking = await prisma.booking.create({
            data: {
                ...restBookingData,
                userId,
                service: {
                    connect: {
                        id: selectedService.id
                    }
                }
            },
        });

        return NextResponse.json(newBooking, { status: 201 });

    } catch (error) {
        console.error("Create Booking Error:", error);
        return NextResponse.json({ error: "An internal server error occurred" }, { status: 500 });
    }
}
