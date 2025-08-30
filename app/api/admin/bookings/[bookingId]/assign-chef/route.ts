import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

async function getBookingDetails(bookingId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { user: true },
  });

  if (!booking) {
    throw new Error("Booking not found");
  }
  return booking;
}

async function getAvailableChefs() {
  return await prisma.user.findMany({
    where: {
      role: "CHEF",
      chefProfile: {
        isNot: null,
      },
    },
    include: {
      chefProfile: true,
    },
  });
}

function formatPrompt(booking: any, chefs: any[]) {
  const bookingInfo = `
    Booking Details:
    - Event Type: ${booking.eventType}
    - Location: ${booking.location}
    - Number of Guests: ${booking.guests}
    - Cuisine Preferences: ${booking.cuisinePreferences.join(", ")}
    - Dietary Restrictions: ${booking.dietaryRestrictions || "None"}
  `;

  const chefsInfo = chefs.map(chef => `
    - Chef ID: ${chef.id}
    - Name: ${chef.name}
    - Specialties: ${chef.chefProfile.specialties.join(", ")}
    - Experience: ${chef.chefProfile.yearsOfExperience} years
  `).join("");

  return `
    Based on the following booking details, select the best chef from the list.
    Return only the JSON object with the "chefId" of the most suitable chef. Do not add any other text or explanation.

    ${bookingInfo}

    Available Chefs:
    ${chefsInfo}

    Response format: {"chefId": "your_selected_chef_id_here"}
  `;
}

export async function POST(
  request: NextRequest
) {
  const authHeader = request.headers.get("Authorization");
  if (authHeader !== `Bearer ${process.env.WEBHOOK_SECRET_KEY}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const parts = url.pathname.split("/");
  // Assuming the URL is /api/admin/bookings/[bookingId]/assign-chef
  const bookingId = parts[parts.length - 2];

  if (!bookingId) {
    return NextResponse.json({ error: "Booking ID is required" }, { status: 400 });
  }

  try {
    const booking = await getBookingDetails(bookingId);
    const chefs = await getAvailableChefs();

    if (chefs.length === 0) {
      return NextResponse.json({ error: "No chefs available" }, { status: 500 });
    }

    const prompt = formatPrompt(booking, chefs);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Clean the response to ensure it's valid JSON
    const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const { chefId } = JSON.parse(cleanedText);

    if (!chefId || !chefs.some(c => c.id === chefId)) {
        throw new Error("Gemini returned an invalid or non-existent Chef ID.");
    }

    await prisma.booking.update({
      where: { id: bookingId },
      data: { chefId: chefId, status: "CONFIRMED" }, // Also confirm the booking status
    });

    return NextResponse.json({ success: true, assignedChefId: chefId });
  } catch (error: any) {
    console.error(`Error assigning chef for booking ${bookingId}:`, error);
    return NextResponse.json(
      { error: "Failed to assign chef.", details: error.message },
      { status: 500 }
    );
  }
}
