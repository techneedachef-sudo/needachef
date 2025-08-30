import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { getUserIdFromRequest } from "@/app/api/auth/_lib/auth-utils";

export async function PUT(
  request: NextRequest
) {
  const chefId = await getUserIdFromRequest(request);
  if (!chefId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const parts = url.pathname.split("/");
  const bookingId = parts[parts.length - 1];
  const { status } = await request.json();

  if (!status) {
    return NextResponse.json(
      { error: "Status is required." },
      { status: 400 }
    );
  }

  try {
    // First, verify the booking belongs to this chef
    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        chefId: chefId,
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found or you are not assigned to it." },
        { status: 404 }
      );
    }

    // Now, update the booking
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status },
    });

    return NextResponse.json(updatedBooking);
  } catch (error) {
    console.error(`Chef error updating booking ${bookingId}:`, error);
    return NextResponse.json(
      { error: "Failed to update booking." },
      { status: 500 }
    );
  }
}
