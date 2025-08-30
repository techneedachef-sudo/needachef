import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query")?.toLowerCase();
  const category = searchParams.get("category")?.toLowerCase();

  let products = await prisma.product.findMany({
    where: {
      AND: [
        category ? {
          category: {
            equals: category,
            mode: 'insensitive',
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
              category: {
                contains: query,
                mode: 'insensitive',
              },
            },
          ],
        } : {},
      ],
    },
  });

  return NextResponse.json(products);
}
