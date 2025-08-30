import { NextRequest, NextResponse } from 'next/server';
import prisma from "@/app/lib/prisma";
import { getUserIdFromRequest } from '@/app/api/auth/_lib/auth-utils';

/**
 * API route to fetch a partner's detailed referral history.
 * This is protected and requires a valid partner session.
 */
export async function GET(request: NextRequest) {
  try {
    const partnerId = await getUserIdFromRequest(request);
    if (!partnerId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch bookings associated with the partner's referrals
    const bookings = await prisma.booking.findMany({
        where: {
            ref: { not: null }, // Only bookings that originated from a referral link
            // Potentially add more complex logic here to link to partnerId if 'ref' contains partner's referral code
        },
        include: {
            user: { select: { name: true, email: true } }, // Include user who made the booking
            service: true, // Include the related service
        },
    });

    // Fetch inquiries associated with the partner's referrals
    const inquiries = await prisma.inquiry.findMany({
        where: {
            partnerId: partnerId, // Inquiries directly linked to this partner
        },
    });

    const referralHistory: any[] = [];

    // Process bookings as referrals
    bookings.forEach(b => {
        // This is a simplified example. In a real system, 'b.ref' would need to be parsed
        // to determine if it belongs to the current partner, or the booking itself
        // would need a direct link to the partnerId.
        // For now, we'll assume any booking with a 'ref' is a potential referral
        // and we'll need to refine this logic later for accurate partner attribution.
        referralHistory.push({
            id: b.id,
            type: 'Booking',
            date: b.createdAt,
            referredFrom: b.ref || 'N/A',
            clientName: b.user?.name || 'N/A',
            clientEmail: b.user?.email || 'N/A',
            commission: 50.00, // Placeholder: Implement actual commission calculation
            status: b.status,
            details: b.service?.name || 'N/A', // Example detail
        });
    });

    // Process inquiries as referrals
    inquiries.forEach(i => {
        referralHistory.push({
            id: i.id,
            type: 'Inquiry',
            date: i.createdAt,
            referredFrom: i.ref || 'N/A',
            clientName: i.contactName,
            clientEmail: i.email,
            commission: 0.00, // Placeholder: Inquiries might not have direct commission
            status: i.status,
            details: i.message.substring(0, 50) + '...', // Example detail
        });
    });

    // Sort referrals by date, newest first
    referralHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json(referralHistory);
  } catch (error) {
    console.error('Failed to fetch partner referrals:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
