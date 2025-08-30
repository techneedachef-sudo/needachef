import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

// GET /api/courses/[id]
export async function GET(request: NextRequest) {
    try {
        // Manually parse the ID from the URL
        const url = new URL(request.url);
        const pathSegments = url.pathname.split('/');
        const id = pathSegments[pathSegments.length - 1];

        if (!id) {
            return NextResponse.json({ error: "Course ID is missing" }, { status: 400 });
        }

        const course = await prisma.course.findUnique({
            where: { id },
            include: {
                modules: {
                    include: {
                        lessons: true,
                    },
                },
            },
        });

        if (!course) {
            return NextResponse.json({ error: "Course not found" }, { status: 404 });
        }

        return NextResponse.json(course);
    } catch (error) {
        console.error("Error fetching course:", error);
        return NextResponse.json({ error: "An internal server error occurred" }, { status: 500 });
    }
}
