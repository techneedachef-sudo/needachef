import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { getUserIdFromRequest } from "@/app/api/auth/_lib/auth-utils";

export async function GET(request: NextRequest) {
  const chefId = await getUserIdFromRequest(request);

  if (!chefId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: chefId } });
    if (!user || user.role !== 'CHEF') {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const bookings = await prisma.booking.findMany({
      where: { chefId },
      orderBy: { date: "asc" },
      include: {
        user: { select: { name: true } }, 
        service: { select: { name: true } },
      },
    });

    const formattedBookings = bookings.map(booking => ({
        id: booking.id,
        customerName: booking.user.name,
        serviceName: booking.service?.name || 'N/A',
        date: booking.date.toISOString(),
        time: booking.time,
        location: booking.location,
        guests: booking.guests,
        status: booking.status,
        eventType: booking.eventType,
        cuisinePreferences: booking.cuisinePreferences,
        dietaryRestrictions: booking.dietaryRestrictions,
        kitchenEquipment: booking.kitchenEquipment,
        details: booking.details,
    }));

    return NextResponse.json(formattedBookings);
  } catch (error) {
    console.error("Failed to fetch chef bookings:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
