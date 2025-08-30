// C:/Users/hp/needachef/app/api/auth/change-password/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from "@/app/lib/prisma";
import { getUserIdFromRequest } from '../_lib/auth-utils';
import bcrypt from "bcrypt";

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { currentPassword, newPassword, confirmPassword } = await request.json();

    // --- Input Validation ---
    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json({ error: 'All password fields are required.' }, { status: 400 });
    }
    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'New password must be at least 6 characters long.' }, { status: 400 });
    }
    if (newPassword !== confirmPassword) {
      return NextResponse.json({ error: 'New passwords do not match.' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
        where: { id: userId },
    });

    if (!user) {
        return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const passwordMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!passwordMatch) {
        return NextResponse.json({ error: "Incorrect current password." }, { status: 400 });
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    await prisma.user.update({
        where: { id: userId },
        data: { passwordHash },
    });

    return NextResponse.json({ message: 'Password updated successfully.' });

  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json(
      { error: 'An internal server error occurred.' },
      { status: 500 }
    );
  }
}
