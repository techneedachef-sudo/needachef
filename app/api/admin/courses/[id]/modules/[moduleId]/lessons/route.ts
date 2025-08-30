import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/app/api/admin/_lib/auth";
import prisma from "@/app/lib/prisma";

// POST /api/admin/courses/[id]/modules/[moduleId]/lessons
export async function POST(request: NextRequest) {
    const url = new URL(request.url);
    const moduleId = url.pathname.split('/')[6];

    if (!await isAdmin()) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    try {
        const lessonData = await request.json();
        const newLesson = await prisma.lesson.create({
            data: {
                ...lessonData,
                moduleId,
            },
        });
        return NextResponse.json(newLesson, { status: 201 });
    } catch {
        return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }
}
