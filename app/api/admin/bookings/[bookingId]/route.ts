import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { isAdmin } from "@/app/api/admin/_lib/auth";

export async function PUT(
  request: NextRequest,
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const url = new URL(request.url);
  const parts = url.pathname.split("/");
  const bookingId = parts[parts.length - 1];
  const { status, chefId } = await request.json();

  if (!status && !chefId) {
    return NextResponse.json(
      { error: "Status or chefId must be provided." },
      { status: 400 }
    );
  }

  try {
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        ...(status && { status }),
        ...(chefId && { chefId }),
      },
      include: {
        user: { select: { name: true } },
        service: { select: { name: true } },
        chef: { select: { name: true } },
      },
    });

    return NextResponse.json(updatedBooking);
  } catch (error) {
    console.error(`Error updating booking ${bookingId}:`, error);
    return NextResponse.json(
      { error: "Failed to update booking." },
      { status: 500 }
    );
  }
}
