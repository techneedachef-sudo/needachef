import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { render } from "@react-email/render";
import { WidgetBookingNotificationEmail } from "@/components/emails/WidgetBookingNotificationEmail";
import React from "react";
import prisma from "@/app/lib/prisma";
import { BookingStatus } from "@/app/generated/prisma";

const resend = new Resend(process.env.RESEND_API_KEY);
const ADMIN_EMAIL = "admin@needachef.ng";

export async function POST(request: NextRequest) {
  try {
    const bookingData = await request.json();
    const {
      name,
      phone,
      location,
      date,
      guests,
      partnerUrl,
      ref,
      utm_source,
      utm_medium,
      utm_campaign,
      selectedService,
    } = bookingData;

    // Input Validation
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Full name is required.' }, { status: 400 });
    }
    if (!phone || typeof phone !== 'string' || phone.trim().length === 0) {
      return NextResponse.json({ error: 'Phone number is required.' }, { status: 400 });
    }
    if (!location || typeof location !== 'string' || location.trim().length === 0) {
      return NextResponse.json({ error: 'Location is required.' }, { status: 400 });
    }
    if (!date || typeof date !== 'string' || isNaN(new Date(date).getTime())) {
      return NextResponse.json({ error: 'Valid date and time are required.' }, { status: 400 });
    }
    if (!guests || typeof guests !== 'number' || guests < 1) {
        return NextResponse.json({ error: 'Number of guests must be at least 1.' }, { status: 400 });
    }
    if (!selectedService) {
        return NextResponse.json({ error: 'Service selection is required.' }, { status: 400 });
    }

    let attributedPartnerId: string | null = null;
    if (ref) {
      const referringPartner = await prisma.user.findFirst({
        where: {
          referralCode: ref,
          role: 'PARTNER',
        },
        select: { id: true },
      });
      if (referringPartner) {
        attributedPartnerId = referringPartner.id;
      }
    }

    // Create a user if not exists (or find existing by phone/email if more robust system is desired)
    // For now, creating a new user with a dummy email based on phone number
    const user = await prisma.user.create({
        data: {
            name,
            email: `${phone}@needachef.ng`, // Dummy email for widget bookings
            passwordHash: '',
            role: 'USER',
        },
    });

    // Determine service details for booking record
    let serviceName = 'N/A';
    let servicePrice = 'N/A';

    if (selectedService.type === 'TIERED' && selectedService.selectedOption) {
        serviceName = `${selectedService.name} - ${selectedService.selectedOption.price}`;
        servicePrice = selectedService.selectedOption.price;
        // guests = derive from selectedService.selectedOption.coverage if possible
    } else if (selectedService.type === 'PER_HEAD') {
        serviceName = `${selectedService.name} - ${selectedService.price}`;
        servicePrice = selectedService.price;
        // guests = derive from selectedService.minGuests if possible
    }

    await prisma.booking.create({
        data: {
            userId: user.id,
            partnerId: attributedPartnerId, // Set partnerId if attributed
            date: new Date(date),
            time: new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            location,
            guests, // Use actual guests value from widget
            status: BookingStatus.PENDING, // Default status
            ref,
            utm_source,
            utm_medium,
            utm_campaign,
            partnerUrl,
        },
    });

    if (process.env.RESEND_API_KEY) {
      const emailHtml = await render(
        React.createElement(WidgetBookingNotificationEmail, {
          name,
          phone,
          location,
          bookingDate: date,
          partnerUrl,
        })
      );

      await resend.emails.send({
        from: process.env.SENDER_EMAIL || "onboarding@resend.dev",
        to: ADMIN_EMAIL,
        subject: `New Chef Booking from ${partnerUrl || 'Widget'}`,
        html: emailHtml,
      });

      console.log("Widget booking notification sent to admin.");
    } else {
        console.warn("RESEND_API_KEY is not set. Email functionality will be disabled.");
    }

    return NextResponse.json(
      { message: "Booking request received successfully." },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error processing widget booking:", error);
    return NextResponse.json({ error: "Failed to process booking due to an internal server error." }, { status: 500 });
  }
}
