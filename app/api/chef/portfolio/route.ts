import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import prisma from '@/app/lib/prisma';
import { getUserIdFromRequest } from '@/app/api/auth/_lib/auth-utils';

export async function POST(request: NextRequest): Promise<NextResponse> {
  const userId = await getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const filename = searchParams.get('filename');

  if (!filename || !request.body) {
    return NextResponse.json({ error: 'No filename provided.' }, { status: 400 });
  }

  try {
    // Ensure the user has a chef profile
    const chefProfile = await prisma.chefProfile.findUnique({
      where: { userId },
    });

    if (!chefProfile) {
      return NextResponse.json({ error: 'Chef profile not found.' }, { status: 404 });
    }

    // Sanitize and create a unique path
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9_.]/g, '_');
    const blobPath = `${userId}/portfolio_${Date.now()}_${sanitizedFilename}`;

    // Upload to Vercel Blob
    const blob = await put(blobPath, request.body, {
      access: 'public',
    });

    // Add the new URL to the existing array of portfolio images
    const updatedPortfolioImages = [...chefProfile.portfolioImages, blob.url];

    await prisma.chefProfile.update({
      where: { userId },
      data: { portfolioImages: updatedPortfolioImages },
    });

    return NextResponse.json({ url: blob.url });
  } catch (error) {
    console.error('Portfolio image upload error:', error);
    return NextResponse.json(
      { error: 'An internal server error occurred.' },
      { status: 500 }
    );
  }
}
