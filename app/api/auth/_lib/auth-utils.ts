import { jwtVerify, JWTPayload } from "jose";
import { USER_COOKIE_NAME } from "@/utils/constants";
import { NextRequest } from "next/server";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function getJwtPayload(token: string): Promise<JWTPayload | null> {
    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        return payload;
    } catch (error) {
        console.error("Error in getJwtPayload:", error);
        return null;
    }
}

export async function getUserIdFromRequest(request: NextRequest): Promise<string | null> {
    const token = request.cookies.get(USER_COOKIE_NAME)?.value;
    if (!token) {
        return null;
    }
    const payload = await getJwtPayload(token);
    return payload?.userId as string | null;
}
