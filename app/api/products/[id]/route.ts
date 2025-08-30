import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

// GET /api/products/[id]
export async function GET(request: NextRequest) {
    const url = new URL(request.url);
    const id = url.pathname.split('/')[3];

    const product = await prisma.product.findUnique({
        where: { id },
        include: {
            reviews: true,
        },
    });

    if (!product) {
        return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // We don't need to hide anything for public product data
    return NextResponse.json(product);
}
