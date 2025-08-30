import { NextRequest, NextResponse } from "next/server";
import { getJwtPayload } from "@/app/api/auth/_lib/auth-utils";
import prisma from "@/app/lib/prisma";
import { USER_COOKIE_NAME } from "@/utils/constants";

export async function GET(request: NextRequest) {
    const token = request.cookies.get(USER_COOKIE_NAME)?.value;
    if (!token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const payload = await getJwtPayload(token);
        if (!payload || !payload.userId) {
            return NextResponse.json({ error: "Invalid token" }, { status: 401 });
        }
        const userId = payload.userId as string;

        const progress = await prisma.userCourseProgress.findMany({
            where: { userId },
        });

        return NextResponse.json(progress);

    } catch (error) {
        console.error("Get Progress Error:", error);
        return NextResponse.json({ error: "An internal server error occurred" }, { status: 500 });
    }
}
