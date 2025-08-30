import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/app/api/admin/_lib/auth";
import prisma from "@/app/lib/prisma";

// GET /api/admin/services
export async function GET() {
    if (!await isAdmin()) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const services = await prisma.service.findMany();
    return NextResponse.json(services);
}

// POST /api/admin/services
export async function POST(request: NextRequest) {
    if (!await isAdmin()) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    try {
        const { name, description, icon, type, options, price, minGuests } = await request.json();
        const newService = await prisma.service.create({
            data: {
                name,
                description,
                icon,
                type,
                options,
                price,
                minGuests,
            },
        });
        return NextResponse.json(newService, { status: 201 });
    } catch {
        return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }
}

// PUT /api/admin/services
export async function PUT(request: NextRequest) {
    if (!await isAdmin()) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    try {
        const { id, name, description, icon, type, options, price, minGuests } = await request.json();
        const updatedService = await prisma.service.update({
            where: { id },
            data: {
                name,
                description,
                icon,
                type,
                options,
                price,
                minGuests,
            },
        });
        return NextResponse.json(updatedService);
    } catch {
        return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }
}

// DELETE /api/admin/services
export async function DELETE(request: NextRequest) {
    if (!await isAdmin()) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    try {
        const { id } = await request.json();
        await prisma.service.delete({
            where: { id },
        });
        return NextResponse.json({ message: "Service deleted" });
    } catch {
        return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }
}
