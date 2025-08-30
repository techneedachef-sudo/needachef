import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { USER_COOKIE_NAME } from "@/utils/constants";
import { jwtVerify } from "jose";
import { Resend } from "resend";
import { render } from "@react-email/render";
import { ChefApplicationConfirmationEmail } from "@/components/emails/ChefApplicationConfirmationEmail";
import React from "react";

const resend = new Resend(process.env.RESEND_API_KEY);
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function POST(request: NextRequest) {
    const token = request.cookies.get(USER_COOKIE_NAME);

    if (!token) {
        return NextResponse.json({ error: "You must be logged in to apply." }, { status: 401 });
    }

    try {
        const { payload } = await jwtVerify(token.value, JWT_SECRET);
        const userId = payload.userId as string;

        const appData = await request.json();
        
        const existingApplication = await prisma.chefApplication.findFirst({
            where: { userId },
        });
        if (existingApplication) {
            return NextResponse.json({ error: "You have already submitted an application." }, { status: 409 });
        }

        await prisma.chefApplication.create({
            data: { ...appData, userId },
        });

        // Send confirmation email
        if (process.env.RESEND_API_KEY) {
            const emailHtml = await render(
                React.createElement(ChefApplicationConfirmationEmail, {
                    fullName: appData.fullName,
                })
            );

            await resend.emails.send({
                from: process.env.SENDER_EMAIL || "onboarding@resend.dev",
                to: appData.email,
                subject: "Your Needachef Application has been Received",
                html: emailHtml,
            });
        } else {
            console.warn("RESEND_API_KEY not set. Skipping application confirmation email.");
        }

        return NextResponse.json({ message: "Application received." }, { status: 201 });
    } catch (error) {
        console.error("Application submission error:", error);
        return NextResponse.json({ error: "Invalid data or session." }, { status: 400 });
    }
}

