import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

// GET /api/services
export async function GET() {
    try {
        const services = await prisma.service.findMany();
        return NextResponse.json(services);
    } catch (error) {
        console.error("Error fetching services:", error);
        return NextResponse.json({ error: "An internal server error occurred" }, { status: 500 });
    }
}
