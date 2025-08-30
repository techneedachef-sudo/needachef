import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

export async function GET() {
    try {
        const categories = await prisma.product.findMany({
            select: {
                category: true,
            },
            distinct: ['category'],
        });
        return NextResponse.json(categories.map(p => p.category));
    } catch (error) {
        console.error("Error fetching categories:", error);
        return NextResponse.json({ error: "An internal server error occurred" }, { status: 500 });
    }
}
