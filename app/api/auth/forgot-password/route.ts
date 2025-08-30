import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import crypto from "crypto";
import { Resend } from "resend";
import { render } from "@react-email/render";
import { PasswordResetEmail } from "@/components/emails/PasswordResetEmail";
import React from "react";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (user) {
      const resetToken = crypto.randomBytes(32).toString("hex");
      await prisma.user.update({
          where: { id: user.id },
          data: {
              passwordResetToken: resetToken,
              passwordResetExpires: new Date(Date.now() + 3600000), // Token expires in 1 hour
          },
      });

      const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password/${resetToken}`;

      if (process.env.RESEND_API_KEY) {
        const emailHtml = await render(
            React.createElement(PasswordResetEmail, {
                userName: user.name,
                resetUrl: resetUrl,
            })
        );

        await resend.emails.send({
            from: process.env.SENDER_EMAIL || "onboarding@resend.dev",
            to: user.email,
            subject: "Reset Your Needachef Password",
            html: emailHtml,
        });
      } else {
          console.warn("RESEND_API_KEY not set. Skipping password reset email.");
          console.log(`Password reset link for ${user.email}: ${resetUrl}`);
      }
    }

    return NextResponse.json({ message: "If an account with that email exists, a password reset link has been sent." });

  } catch (error) {
    console.error("Forgot Password Error:", error);
    return NextResponse.json({ error: "An internal server error occurred" }, { status: 500 });
  }
}
