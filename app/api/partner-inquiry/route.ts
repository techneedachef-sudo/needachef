import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { render } from "@react-email/render";
import { PartnerInquiryConfirmationEmail } from "@/components/emails/PartnerInquiryConfirmationEmail";
import React from "react";
import prisma from "@/app/lib/prisma";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { companyName, contactName, email, phone, message } = await request.json();

    // Basic input validation
    if (!companyName || typeof companyName !== 'string' || companyName.trim().length === 0) {
      return NextResponse.json({ error: 'Company name is required' }, { status: 400 });
    }
    if (!contactName || typeof contactName !== 'string' || contactName.trim().length < 2) {
      return NextResponse.json({ error: 'Contact name must have at least 2 letters' }, { status: 400 });
    }
    if (!email || typeof email !== 'string' || !/^\S+@\S+$/.test(email)) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }
    // Phone is optional, no strict validation for now

    // Save the inquiry using prisma
    const newInquiry = await prisma.inquiry.create({
        data: {
            companyName,
            contactName,
            email,
            phone,
            message,
            status: 'NEW', // Default status for new inquiries
        },
    });

    if (process.env.RESEND_API_KEY) {
      const emailHtml = await render(
        React.createElement(PartnerInquiryConfirmationEmail, {
          contactName,
          companyName,
        })
      );

      await resend.emails.send({
        from: process.env.SENDER_EMAIL || "onboarding@resend.dev",
        to: email,
        subject: "Thank You for Your Partnership Inquiry",
        html: emailHtml,
      });

      console.log("Inquiry confirmation email sent to:", email);
    } else {
        console.warn("RESEND_API_KEY is not set. Email functionality will be disabled.");
    }

    return NextResponse.json(
      { message: "Inquiry received successfully.", inquiry: newInquiry },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Error processing partner inquiry:", error);
    return NextResponse.json({ error: "Failed to submit inquiry due to an internal server error." }, { status: 500 });
  }
}
