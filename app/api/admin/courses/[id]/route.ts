import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/app/api/admin/_lib/auth";
import prisma from "@/app/lib/prisma";

// GET /api/admin/courses/[id]
export async function GET(request: NextRequest) {
    const url = new URL(request.url);
    const id = url.pathname.split('/')[4];

    if (!await isAdmin()) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const course = await prisma.course.findUnique({
        where: { id },
        include: {
            modules: {
                include: {
                    lessons: true,
                },
            },
        },
    });
    if (!course) {
        return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }
    return NextResponse.json(course);
}
