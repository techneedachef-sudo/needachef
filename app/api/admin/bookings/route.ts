import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { isAdmin } from "@/app/api/admin/_lib/auth";

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const bookings = await prisma.booking.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      user: { select: { name: true } },
      service: { select: { name: true } },
      chef: { select: { name: true } },
    },
  });

  const formattedBookings = bookings.map((booking) => ({
    id: booking.id,
    userName: booking.user.name,
    serviceName: booking.service?.name || "N/A",
    chefName: booking.chef?.name || null,
    date: booking.date.toISOString(),
    time: booking.time,
    status: booking.status,
    location: booking.location,
    guests: booking.guests,
    eventType: booking.eventType,
    cuisinePreferences: booking.cuisinePreferences,
    dietaryRestrictions: booking.dietaryRestrictions,
    kitchenEquipment: booking.kitchenEquipment,
    details: booking.details,
  }));

  return NextResponse.json(formattedBookings);
}
