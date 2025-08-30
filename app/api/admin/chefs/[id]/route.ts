import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { getJwtPayload } from "@/app/api/auth/_lib/auth-utils";
import { USER_COOKIE_NAME } from "@/utils/constants";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const parts = url.pathname.split("/");
  const id = parts[parts.length - 1];
    const token = request.cookies.get(USER_COOKIE_NAME)?.value;
    if (!token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const payload = await getJwtPayload(token);
        if (!payload || payload.role !== 'ADMIN') {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const chef = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                bio: true,
                role: true,
                profilePicture: true,
                chefProfile: true,
            },
        });

        if (!chef || chef.role !== 'CHEF') {
            return NextResponse.json({ error: "Chef not found" }, { status: 404 });
        }

        return NextResponse.json(chef);

    } catch (error) {
        console.error("Get Chef Details Error:", error);
        return NextResponse.json({ error: "An internal server error occurred" }, { status: 500 });
    }
}
