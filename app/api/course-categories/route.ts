import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

export async function GET() {
    try {
        const categories = await prisma.course.findMany({
            select: {
                category: true,
            },
            distinct: ['category'],
        });
        return NextResponse.json(categories.map(c => c.category));
    } catch (error) {
        console.error("Error fetching course categories:", error);
        return NextResponse.json({ error: "An internal server error occurred" }, { status: 500 });
    }
}
