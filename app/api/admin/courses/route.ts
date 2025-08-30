import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { isAdmin } from "@/app/api/admin/_lib/auth";

// GET all courses
export async function GET() {
  if (!await isAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const courses = await prisma.course.findMany();
  return NextResponse.json(courses);
}

// POST a new course
export async function POST(request: NextRequest) {
    if (!await isAdmin()) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    try {
        const courseData = await request.json();
        const newCourse = await prisma.course.create({
            data: courseData,
        });
        return NextResponse.json(newCourse, { status: 201 });
    } catch {
        return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }
}

// PUT (update) a course
export async function PUT(request: NextRequest) {
    if (!await isAdmin()) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    try {
        const { id, ...courseData } = await request.json();
        if (!id) {
            return NextResponse.json({ error: "Missing course ID" }, { status: 400 });
        }
        const updatedCourse = await prisma.course.update({
            where: { id },
            data: courseData,
        });
        return NextResponse.json(updatedCourse);
    } catch {
        return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }
}

// DELETE a course
export async function DELETE(request: NextRequest) {
    if (!await isAdmin()) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    try {
        const { id } = await request.json();
        if (!id) {
            return NextResponse.json({ error: "Missing course ID" }, { status: 400 });
        }
        await prisma.course.delete({
            where: { id },
        });
        return NextResponse.json({ message: "Course deleted successfully" });
    } catch {
        return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }
}
