import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { isAdmin } from "@/app/api/admin/_lib/auth";

export async function GET() {
    if (!(await isAdmin())) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const totalRevenue = await prisma.order.aggregate({
        _sum: {
            total: true,
        },
    });

    const newChefApplications = await prisma.chefApplication.count({
        where: {
            status: "PENDING",
        },
    });

    const pendingInquiries = await prisma.inquiry.count({
        where: {
            status: "NEW",
        },
    });

    const totalUsers = await prisma.user.count();

    return NextResponse.json({
        totalRevenue: totalRevenue._sum.total || 0,
        newChefApplications,
        pendingInquiries,
        totalUsers,
    });
}
