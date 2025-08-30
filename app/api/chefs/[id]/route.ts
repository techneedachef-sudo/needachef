import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

export async function GET(request: NextRequest) {
    try {
  const url = new URL(request.url);
  const parts = url.pathname.split("/");
  const id = parts[parts.length - 1];

        const chef = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                bio: true,
                profilePicture: true,
                role: true,
                chefProfile: {
                    select: {
                        specialties: true,
                        yearsOfExperience: true,
                        portfolioImages: true,
                    }
                },
            },
        });

        if (!chef || chef.role !== 'CHEF') {
            return NextResponse.json({ error: "Chef not found" }, { status: 404 });
        }

        // Only expose necessary public information
        const publicChefData = {
            id: chef.id,
            name: chef.name,
            bio: chef.bio,
            profilePicture: chef.profilePicture,
            chefProfile: chef.chefProfile ? {
                specialties: chef.chefProfile.specialties,
                yearsOfExperience: chef.chefProfile.yearsOfExperience,
                portfolioImages: chef.chefProfile.portfolioImages,
            } : null,
        };

        return NextResponse.json(publicChefData);

    } catch (error) {
        console.error("Get Public Chef Details Error:", error);
        return NextResponse.json({ error: "An internal server error occurred" }, { status: 500 });
    }
}