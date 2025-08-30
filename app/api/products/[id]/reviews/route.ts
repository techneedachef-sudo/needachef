import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { USER_COOKIE_NAME } from "@/utils/constants";
import { getJwtPayload } from "@/app/api/auth/_lib/auth-utils";

// POST /api/products/[id]/reviews
export async function POST(request: NextRequest) {
    const url = new URL(request.url);
    const productId = url.pathname.split('/')[3];

    const token = request.cookies.get(USER_COOKIE_NAME)?.value;
    if (!token) {
        return NextResponse.json({ error: "You must be logged in to leave a review." }, { status: 401 });
    }

    try {
        const payload = await getJwtPayload(token);
        if (!payload || !payload.userId) {
            return NextResponse.json({ error: "Invalid token" }, { status: 401 });
        }
        const userId = payload.userId as string;
        const { rating, comment } = await request.json();

        if (!rating || !comment) {
            return NextResponse.json({ error: "Rating and comment are required." }, { status: 400 });
        }
        
        // Verify the user has purchased this product
        const userOrders = await prisma.order.findMany({
            where: { userId },
        });
        const hasPurchased = userOrders.some(order => (order.items as any[]).some(item => item.id === productId));
        if (!hasPurchased) {
            return NextResponse.json({ error: "You can only review products you have purchased." }, { status: 403 });
        }

        const review = await prisma.review.create({
            data: {
                userId,
                productId,
                rating,
                comment,
            },
        });

        return NextResponse.json(review, { status: 201 });

    } catch (error) {
        console.error("Submit Review Error:", error);
        return NextResponse.json({ error: "An internal server error occurred" }, { status: 500 });
    }
}
