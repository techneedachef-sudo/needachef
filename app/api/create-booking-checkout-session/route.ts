import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import axios from "axios";
import { getUserIdFromRequest } from "@/app/api/auth/_lib/auth-utils";

const PAYSTACK_API_URL = "https://api.paystack.co";
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

export async function POST(request: NextRequest) {
  const userId = await getUserIdFromRequest(request);

  if (!userId) {
    return NextResponse.json({ error: "You must be logged in to book a service." }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
        where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const bookingData = await request.json();
    const { selectedService, serviceId, serviceType, serviceOptionIndex, date, ...restBookingData } = bookingData;

    if (!date) {
        return NextResponse.json({ error: "Date is a required field." }, { status: 400 });
    }
    
    const bookingDate = new Date(date);
    if (isNaN(bookingDate.getTime())) {
        return NextResponse.json({ error: "Invalid date format." }, { status: 400 });
    }

    let serviceName = "";
    let servicePrice = "";
    let amount = 0;

    if (selectedService) {
        if (selectedService.type === "TIERED") {
            serviceName = `${selectedService.tier.name} - ${selectedService.option.price}`;
            servicePrice = selectedService.option.price;
        } else if (selectedService.type === "PER_HEAD") {
            serviceName = `${selectedService.option.name} - ${selectedService.option.price}`;
            servicePrice = selectedService.option.price;
        }
    }

    // Extract the numeric value from the price string (e.g., "₦50,000 / booking")
    const priceMatch = servicePrice.match(/(\d{1,3}(,\d{3})*(\.\d+)?)/);
    if (priceMatch) {
        amount = parseFloat(priceMatch[0].replace(/,/g, ''));
    }

    if (selectedService.type === "PER_HEAD") {
        amount *= bookingData.guests || 1;
    }

    if (amount <= 0) {
        return NextResponse.json({ error: "Invalid service price." }, { status: 400 });
    }

    const newBooking = await prisma.booking.create({
        data: {
            ...restBookingData,
            date: bookingDate,
            userId,
            serviceId,
            paymentAmount: amount,
            paymentStatus: "PENDING",
            status: "PENDING",
        },
    });

    const paystackResponse = await axios.post(
      `${PAYSTACK_API_URL}/transaction/initialize`,
      {
        email: user.email,
        amount: amount * 100, // Paystack amount is in kobo/cents
        currency: "NGN",
        metadata: {
          bookingId: newBooking.id,
          userId: user.id,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const { authorization_url, reference, access_code } = paystackResponse.data.data;

    // Store the payment reference in the booking
    await prisma.booking.update({
        where: { id: newBooking.id },
        data: { paymentReference: reference },
    });

    return NextResponse.json({ 
        authorization_url,
        reference, 
        access_code, 
        email: user.email, 
        amount: amount 
    });

  } catch (err: unknown) {
    console.error("Error creating Paystack session for booking:", err);
    const error = err as any;
    return NextResponse.json(
      { error: "Failed to initialize payment session.", details: error.response?.data?.message || error.message },
      { status: 500 }
    );
  }
}
