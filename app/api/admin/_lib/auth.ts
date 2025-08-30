import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import prisma from "@/app/lib/prisma";
import { USER_COOKIE_NAME } from "@/utils/constants";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function isAdmin() {
    const cookieStore = await cookies();
    const token = cookieStore.get(USER_COOKIE_NAME);

    if (!token) return false;

    try {
        const { payload } = await jwtVerify(token.value, JWT_SECRET);
        const user = await prisma.user.findUnique({
            where: { id: payload.userId as string },
        });
        return user?.role === 'ADMIN';
    } catch {
        return false;
    }
}

