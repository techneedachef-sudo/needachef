import { NextResponse, NextRequest } from "next/server";
import prisma from "@/app/lib/prisma";
import { isAdmin } from "@/app/api/admin/_lib/auth";
import { ChefApplicationStatus, Role } from "@/app/generated/prisma";
import { Resend } from "resend";
import { render } from "@react-email/render";
import { ChefApplicationApprovedEmail } from "@/components/emails/ChefApplicationApprovedEmail";
import React from "react";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET() {
  if (!await isAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const applicationsWithUser = await prisma.chefApplication.findMany({
    include: {
      user: { select: { name: true, email: true } },
    },
  });

  const applications = applicationsWithUser.map(({ user, ...app }) => ({
    ...app,
    fullName: user.name,
    email: user.email,
  }));

  return NextResponse.json(applications);
}

export async function PUT(request: NextRequest) {
  if (!await isAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id, status } = await request.json();
    if (!id || !status) {
      return NextResponse.json({ error: "Missing id or status" }, { status: 400 });
    }

    const updatedApp = await prisma.chefApplication.update({
      where: { id },
      data: { status: status as ChefApplicationStatus },
      include: {
        user: true, // Include user to get their details for role update and email
      },
    });

    // If the application is approved, update user role and create chef profile
    if (updatedApp.status === 'APPROVED') {
      // Update user role to CHEF
      await prisma.user.update({
        where: { id: updatedApp.userId },
        data: { role: Role.CHEF },
      });

      // Create ChefProfile if it doesn't exist
      await prisma.chefProfile.upsert({
        where: { userId: updatedApp.userId },
        update: {
          specialties: [], // You might want to get this from the application or a separate form
          yearsOfExperience: parseInt(updatedApp.experience), // Convert string to int
          portfolioImages: [], // You might want to get this from the application or a separate form
        },
        create: {
          userId: updatedApp.userId,
          specialties: [],
          yearsOfExperience: parseInt(updatedApp.experience),
          portfolioImages: [],
        },
      });

      // Send approval email
      if (process.env.RESEND_API_KEY && updatedApp.user.email) {
        const emailHtml = await render(
          React.createElement(ChefApplicationApprovedEmail, {
            fullName: updatedApp.user.name || updatedApp.fullName,
            email: updatedApp.user.email,
          })
        );

        await resend.emails.send({
          from: process.env.SENDER_EMAIL || "onboarding@resend.dev",
          to: updatedApp.user.email,
          subject: "Congratulations! Your Needachef Application Has Been Approved!",
          html: emailHtml,
        });
        console.log("Chef application approval email sent to:", updatedApp.user.email);
      } else {
        console.warn("RESEND_API_KEY is not set or user email is missing. Approval email not sent.");
      }
    }

    return NextResponse.json(updatedApp);
  } catch (error) {
    console.error("Error updating chef application:", error);
    return NextResponse.json({ error: "An internal server error occurred." }, { status: 500 });
  }
}


