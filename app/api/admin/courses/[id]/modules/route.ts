import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/app/api/admin/_lib/auth";
import prisma from "@/app/lib/prisma";

// GET /api/admin/courses/[id]/modules
export async function GET(request: NextRequest) {
    const url = new URL(request.url);
    const id = url.pathname.split('/')[4];

    if (!await isAdmin()) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const modules = await prisma.module.findMany({
        where: { courseId: id },
    });
    return NextResponse.json(modules);
}

// POST /api/admin/courses/[id]/modules
export async function POST(request: NextRequest) {
    const url = new URL(request.url);
    const id = url.pathname.split('/')[4];

    if (!await isAdmin()) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    try {
        const moduleData = await request.json();
        const newModule = await prisma.module.create({
            data: {
                ...moduleData,
                courseId: id,
            },
        });
        return NextResponse.json(newModule, { status: 201 });
    } catch {
        return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }
}
