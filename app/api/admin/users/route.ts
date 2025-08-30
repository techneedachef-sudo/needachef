import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { jwtVerify } from "jose";
import { USER_COOKIE_NAME } from "@/utils/constants";
import { Role } from "@/app/generated/prisma";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

async function isAdmin(request: NextRequest) {
    const token = request.cookies.get(USER_COOKIE_NAME);
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

export async function GET(request: NextRequest) {
  if (!await isAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const users = await prisma.user.findMany({
    select: {
        id: true,
        name: true,
        email: true,
        role: true,
        profilePicture: true,
        phone: true,
        address: true,
        bio: true,
        referralCode: true,
    }
  });
  return NextResponse.json(users);
}

export async function PUT(request: NextRequest) {
    if (!await isAdmin(request)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id, role, ...otherUserData } = await request.json();
        if (!id) {
            return NextResponse.json({ error: "Missing id" }, { status: 400 });
        }
        const updatedUser = await prisma.user.update({
            where: { id },
            data: { ...otherUserData, role: role as Role },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                profilePicture: true,
                phone: true,
                address: true,
                bio: true,
                referralCode: true,
            }
        });
        return NextResponse.json(updatedUser);
    } catch {
        return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }
}

export async function DELETE(request: NextRequest) {
    if (!await isAdmin(request)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id } = await request.json();
        if (!id) {
            return NextResponse.json({ error: "Missing id" }, { status: 400 });
        }
        await prisma.user.delete({
            where: { id },
        });
        return NextResponse.json({ message: "User deleted" });
    } catch {
        return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }
}
