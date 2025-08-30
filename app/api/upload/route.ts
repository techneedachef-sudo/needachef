import { put } from '@vercel/blob';
import { NextResponse, NextRequest } from 'next/server';
import { USER_COOKIE_NAME } from '@/utils/constants';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function POST(request: NextRequest): Promise<NextResponse> {
  const token = request.cookies.get(USER_COOKIE_NAME);

  if (!token) {
    return NextResponse.json({ error: 'You must be logged in to upload files.' }, { status: 401 });
  }

  try {
    const { payload } = await jwtVerify(token.value, JWT_SECRET);
    const userId = payload.userId as string;

    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename');

    if (!filename || !request.body) {
      return NextResponse.json({ error: 'No filename provided.' }, { status: 400 });
    }
    
    // Sanitize filename to prevent path traversal
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9_.]/g, '_');
    
    const blobPath = `${userId}/resume_${sanitizedFilename}`;

    const blob = await put(blobPath, request.body, {
      access: 'public',
    });

    return NextResponse.json(blob);
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Invalid session or upload failed.' }, { status: 400 });
  }
}
