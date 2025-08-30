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
    // Sanitize filename
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9_.]/g, '_');
    const blobPath = `${userId}/profile_${sanitizedFilename}`;

    // Upload to Vercel Blob
    const blob = await put(blobPath, request.body, {
      access: 'public',
    });

    // Update user's profilePicture URL in the database
    await prisma.user.update({
      where: { id: userId },
      data: { profilePicture: blob.url },
    });

    return NextResponse.json({ url: blob.url });
  } catch (error) {
    console.error('Profile picture upload error:', error);
    return NextResponse.json(
      { error: 'An internal server error occurred.' },
      { status: 500 }
    );
  }
}
