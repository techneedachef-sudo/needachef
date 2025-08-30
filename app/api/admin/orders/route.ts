import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { isAdmin } from "@/app/api/admin/_lib/auth";
import { OrderStatus } from "@/app/generated/prisma";

export async function GET() {
  if (!await isAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const orders = await prisma.order.findMany();
  return NextResponse.json(orders);
}

export async function PUT(request: NextRequest) {
    if (!await isAdmin()) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id, status } = await request.json();
        if (!id || !status) {
            return NextResponse.json({ error: "Missing id or status" }, { status: 400 });
        }
        const updatedOrder = await prisma.order.update({
            where: { id },
            data: { status: status as OrderStatus },
        });
        return NextResponse.json(updatedOrder);
    } catch {
        return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }
}



