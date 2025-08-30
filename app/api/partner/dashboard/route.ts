// C:/Users/hp/needachef/app/api/partner/dashboard/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from "@/app/lib/prisma";
import { getUserIdFromRequest } from '@/app/api/auth/_lib/auth-utils';

interface Referral {
  id: string;
  type: 'Inquiry' | 'Booking';
  date: Date;
  referredFrom: string;
  commission: number;
  status: string;
}

/**
 * API route to fetch all data needed for the partner dashboard.
 * This is protected and requires a valid user session.
 */
export async function GET(request: NextRequest) {
  try {
    const partnerId = await getUserIdFromRequest(request);
    if (!partnerId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // NOTE: The current Booking model does not have a direct 'partnerId' field.
    // The query below fetches bookings *made by* the partner, not bookings *referred by* the partner.
    // For robust referral tracking of bookings, the Booking model should be updated to include a 'partnerId' field.
    const bookings = await prisma.booking.findMany({
        where: {
            partnerId: partnerId,
        },
        include: {
            service: true, // Include the related service to access its price
        }
    });

    const inquiries = await prisma.inquiry.findMany({
        where: {
            partnerId: partnerId,
        },
    });

    const referralHistory: Referral[] = [];

    // Process inquiries as referrals (more reliably linked via partnerId)
    inquiries.forEach(i => {
        const commission = 0.00; // Inquiries typically don't have direct commission
        referralHistory.push({
            id: i.id,
            type: 'Inquiry',
            date: i.createdAt,
            referredFrom: i.ref || 'N/A',
            commission: commission,
            status: i.status,
        });
    });

    // Process bookings as referrals
    bookings.forEach(b => {
        let numericPrice = 0;
        // Use paymentAmount if available, otherwise parse from the related service's price string
        if (b.paymentAmount) {
            numericPrice = b.paymentAmount;
        } else if (b.service && b.service.price) {
            const priceMatch = b.service.price.match(/\d+,?\d*/);
            numericPrice = priceMatch ? parseFloat(priceMatch[0].replace(/,/, '')) : 0;
        }
        
        const bookingCommission = numericPrice * 0.10; // 10% commission on booking price

        referralHistory.push({
            id: b.id,
            type: 'Booking',
            date: b.date,
            referredFrom: b.ref || 'N/A',
            commission: bookingCommission,
            status: b.status,
        });
    });

    const referrals = referralHistory;

    let totalCommission = 0;
    let pendingCommission = 0;
    let totalInquiries = 0;
    let confirmedInquiries = 0;

    referrals.forEach(r => {
        totalCommission += r.commission;
        if (r.status === 'PENDING' || r.status === 'NEW' || r.status === 'CONTACTED') { // Assuming these are pending statuses
            pendingCommission += r.commission;
        }

        if (r.type === 'Inquiry') {
            totalInquiries++;
            if (r.status === 'CONFIRMED') { // Assuming 'CONFIRMED' means a converted inquiry
                confirmedInquiries++;
            }
        }
    });

    const conversionRate = totalInquiries > 0 ? (confirmedInquiries / totalInquiries) * 100 : 0;

    const stats = {
        totalReferrals: { value: referrals.length.toString(), diff: 0, period: 'last month' },
        totalCommission: { value: `${totalCommission.toFixed(2)}`, diff: 0, period: 'last month' },
        conversionRate: { value: `${conversionRate.toFixed(2)}%`, diff: 0, period: 'last month' },
        pendingCommission: { value: `${pendingCommission.toFixed(2)}`, diff: 0, period: 'last month' },
    };

    return NextResponse.json({ referrals, stats });
  } catch (error) {
    console.error('Failed to fetch partner dashboard data:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
