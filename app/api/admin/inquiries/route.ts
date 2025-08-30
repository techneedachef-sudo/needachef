import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { isAdmin } from "@/app/api/admin/_lib/auth";
import { InquiryStatus } from "@/app/generated/prisma";

export async function GET() {
  if (!await isAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const inquiries = await prisma.inquiry.findMany();
  return NextResponse.json(inquiries);
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
        const updatedInquiry = await prisma.inquiry.update({
            where: { id },
            data: { status: status as InquiryStatus },
        });
        return NextResponse.json(updatedInquiry);
    } catch (error) {
        console.error("Error updating inquiry:", error);
        return NextResponse.json({ error: "An internal server error occurred." }, { status: 500 });
    }
}


