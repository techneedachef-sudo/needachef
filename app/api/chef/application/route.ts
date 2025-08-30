import { NextRequest, NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/app/api/auth/_lib/auth-utils";
import prisma from "@/app/lib/prisma";

export async function GET(request: NextRequest) {
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const application = await prisma.chefApplication.findFirst({
        where: { userId },
    });

    if (!application) {
        return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    return NextResponse.json(application);
}
