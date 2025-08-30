import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { USER_COOKIE_NAME } from "@/utils/constants";
import { getJwtPayload } from "@/app/api/auth/_lib/auth-utils";

export async function POST(request: NextRequest) {
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

        const { courseId, completedLessons, lastViewedLesson } = await request.json();

        const progress = await prisma.userCourseProgress.upsert({
            where: {
                userId_courseId: {
                    userId,
                    courseId,
                },
            },
            update: {
                completedLessons,
                lastViewedLesson,
            },
            create: {
                userId,
                courseId,
                completedLessons,
                lastViewedLesson,
            },
        });

        return NextResponse.json(progress);

    } catch (error) {
        console.error("Update Progress Error:", error);
        return NextResponse.json({ error: "An internal server error occurred" }, { status: 500 });
    }
}
