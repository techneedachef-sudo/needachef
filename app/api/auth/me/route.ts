import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { USER_COOKIE_NAME } from "@/utils/constants";
import prisma from "@/app/lib/prisma";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function GET(request: NextRequest) {
  const token = request.cookies.get(USER_COOKIE_NAME);

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { payload } = await jwtVerify(token.value, JWT_SECRET);
    const userId = payload.userId as string;
    const user = await prisma.user.findUnique({
        where: { id: userId },
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
            chefProfile: {
                select: {
                    specialties: true,
                    yearsOfExperience: true,
                    portfolioImages: true,
                },
            },
        }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}

export async function PUT(request: NextRequest) {
  const token = request.cookies.get(USER_COOKIE_NAME);

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { payload } = await jwtVerify(token.value, JWT_SECRET);
    const userId = payload.userId as string;
    
    const body = await request.json();

    // Basic validation to ensure no forbidden fields are passed
    const { role, passwordHash, id, email, chefProfile, ...updateData } = body;

    const data: any = { ...updateData };

    if (chefProfile) {
      data.chefProfile = {
        update: chefProfile,
      };
    }

    const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: data,
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

  } catch (error) {
    console.error("Profile update error:", error);
    if (error instanceof Error && error.name === 'JOSEError') {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
