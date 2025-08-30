import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { isAdmin } from "@/app/api/admin/_lib/auth";

export async function GET() {
  if (!await isAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const products = await prisma.product.findMany();
  return NextResponse.json(products);
}

export async function POST(request: NextRequest) {
    if (!await isAdmin()) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    try {
        const productData = await request.json();
        const newProduct = await prisma.product.create({
            data: productData,
        });
        return NextResponse.json(newProduct, { status: 201 });
    } catch {
        return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }
}

export async function PUT(request: NextRequest) {
    if (!await isAdmin()) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    try {
        const { id, ...productData } = await request.json();
        if (!id) {
            return NextResponse.json({ error: "Missing id" }, { status: 400 });
        }
        const updatedProduct = await prisma.product.update({
            where: { id },
            data: productData,
        });
        return NextResponse.json(updatedProduct);
    } catch {
        return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }
}

export async function DELETE(request: NextRequest) {
    if (!await isAdmin()) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    try {
        const { id } = await request.json();
        if (!id) {
            return NextResponse.json({ error: "Missing id" }, { status: 400 });
        }
        await prisma.product.delete({
            where: { id },
        });
        return NextResponse.json({ message: "Product deleted" });
    } catch {
        return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }
}
