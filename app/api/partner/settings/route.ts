// C:/Users/hp/needachef/app/api/partner/settings/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from "@/app/lib/prisma";
import { getUserIdFromRequest } from '@/app/api/auth/_lib/auth-utils';

/**
 * API route to GET partner settings.
 */
export async function GET(request: NextRequest) {
  try {
    const partnerId = await getUserIdFromRequest(request);
    if (!partnerId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const settings = await prisma.user.findUnique({
        where: { id: partnerId },
        select: {
            name: true,
            email: true,
            paymentMethod: true, // Uncommented after schema migration
            paymentDetail: true, // Uncommented after schema migration
        },
    });
    if (!settings) {
      return NextResponse.json({ error: 'Partner settings not found' }, { status: 404 });
    }
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Failed to fetch partner settings:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve settings due to an internal server error.' },
      { status: 500 }
    );
  }
}

/**
 * API route to POST (update) partner settings.
 */
export async function POST(request: NextRequest) {
  try {
    const partnerId = await getUserIdFromRequest(request);
    if (!partnerId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, email, paymentMethod, paymentDetail } = await request.json();

    // Basic input validation
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }
    if (!email || typeof email !== 'string' || !/^\S+@\S+$/.test(email)) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }
    if (paymentMethod && !['paypal', 'bank_transfer'].includes(paymentMethod)) {
        return NextResponse.json({ error: 'Invalid payment method' }, { status: 400 });
    }
    if (paymentMethod && (!paymentDetail || typeof paymentDetail !== 'string' || paymentDetail.trim().length === 0)) {
        return NextResponse.json({ error: 'Payment detail is required for the selected payment method' }, { status: 400 });
    }

    const updatedSettings = await prisma.user.update({
        where: { id: partnerId },
        data: {
            name,
            email,
            paymentMethod, // Uncommented after schema migration
            paymentDetail, // Uncommented after schema migration
        },
        select: {
            name: true,
            email: true,
            paymentMethod: true, // Uncommented after schema migration
            paymentDetail: true, // Uncommented after schema migration
        },
    });
    return NextResponse.json(updatedSettings);
  } catch (error) {
    console.error('Failed to update partner settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings due to an internal server error.' },
      { status: 500 }
    );
  }
}
