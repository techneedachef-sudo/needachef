import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/app/api/admin/_lib/auth";
import prisma from "@/app/lib/prisma";

// PUT /api/admin/courses/[id]/modules/[moduleId]
export async function PUT(request: NextRequest) {
    const url = new URL(request.url);
    const moduleId = url.pathname.split('/')[6];

    if (!await isAdmin()) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    try {
        const moduleData = await request.json();
        const updatedModule = await prisma.module.update({
            where: { id: moduleId },
            data: moduleData,
        });
        return NextResponse.json(updatedModule);
    } catch {
        return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }
}

// DELETE /api/admin/courses/[id]/modules/[moduleId]
export async function DELETE(request: NextRequest) {
    const url = new URL(request.url);
    const moduleId = url.pathname.split('/')[6];

    if (!await isAdmin()) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await prisma.module.delete({
        where: { id: moduleId },
    });
    return NextResponse.json({ message: "Module deleted" });
}
