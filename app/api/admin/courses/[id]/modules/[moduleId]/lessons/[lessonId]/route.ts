import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/app/api/admin/_lib/auth";
import prisma from "@/app/lib/prisma";

// PUT /api/admin/courses/[id]/modules/[moduleId]/lessons/[lessonId]
export async function PUT(request: NextRequest) {
    const url = new URL(request.url);
    const lessonId = url.pathname.split('/')[8];

    if (!await isAdmin()) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    try {
        const lessonData = await request.json();
        const updatedLesson = await prisma.lesson.update({
            where: { id: lessonId },
            data: lessonData,
        });
        return NextResponse.json(updatedLesson);
    } catch {
        return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }
}

// DELETE /api/admin/courses/[id]/modules/[moduleId]/lessons/[lessonId]
export async function DELETE(request: NextRequest) {
    const url = new URL(request.url);
    const lessonId = url.pathname.split('/')[8];

    if (!await isAdmin()) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await prisma.lesson.delete({
        where: { id: lessonId },
    });
    return NextResponse.json({ message: "Lesson deleted" });
}
