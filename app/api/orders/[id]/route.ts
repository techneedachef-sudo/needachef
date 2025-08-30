import { NextRequest, NextResponse } from "next/server";

import prisma from "@/app/lib/prisma";
import { USER_COOKIE_NAME } from "@/utils/constants";
import { getJwtPayload } from "../../auth/_lib/auth-utils";

export async function GET(request: NextRequest) {
    const url = new URL(request.url);
    const orderId = url.pathname.split('/')[3];

    const token = request.cookies.get(USER_COOKIE_NAME)?.value;
    if (!token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const payload = await getJwtPayload(token);
        if (!payload || !payload.userId) {
            return NextResponse.json({ error: "Invalid token" }, { status: 401 });
        }
        const userId = payload.userId as string;

        const order = await prisma.order.findUnique({
            where: { id: orderId },
        });

        if (!order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        // Security check: Ensure the user owns this order
        if (order.userId !== userId) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        return NextResponse.json(order);

    } catch (error) {
        console.error("Get Order Details Error:", error);
        return NextResponse.json({ error: "An internal server error occurred" }, { status: 500 });
    }
}
