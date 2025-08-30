import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query")?.toLowerCase();
  const specialty = searchParams.get("specialty")?.toLowerCase();

  let chefs = await prisma.user.findMany({
    where: {
      role: 'CHEF',
      AND: [
        specialty ? {
          chefProfile: {
            specialties: {
              has: specialty,
            },
          },
        } : {},
        query ? {
          OR: [
            {
              name: {
                contains: query,
                mode: 'insensitive',
              },
            },
            {
              bio: {
                contains: query,
                mode: 'insensitive',
              },
            },
          ],
        } : {},
      ],
    },
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
        chefProfile: true,
    }
  });

  return NextResponse.json(chefs);
}
