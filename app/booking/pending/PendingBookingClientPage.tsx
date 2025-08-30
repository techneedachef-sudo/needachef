"use client";

import { useSearchParams, useRouter } from 'next/navigation';
import { Container, Title, Text, Paper, Button, Alert, Loader } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import useSWR from 'swr';
import { useState } from 'react';
import { handleApiError } from '@/utils/errorHandler';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function PendingBookingClientPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const ref = searchParams.get('ref');
    const [loading, setLoading] = useState(false);

    const { data: booking, error } = useSWR(ref ? `/api/booking/details?ref=${ref}` : null, fetcher);

    const handleRetryPayment = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/booking/retry-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reference: ref }),
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || "Failed to re-initialize payment.");
            }

            const session = await response.json();

            const handler = (window as any).PaystackPop.setup({
                key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!,
                email: session.email,
                amount: session.amount * 100,
                ref: session.access_code, // Use access_code to initialize
                onClose: () => setLoading(false),
                callback: (response: any) => {
                    router.push(`/booking/verify?ref=${response.reference}`);
                },
            });

            handler.openIframe();

        } catch (e) {
            handleApiError(e);
            setLoading(false);
        }
    };

    if (error) {
        return (
            <Container size="sm" my="xl">
                <Alert color="red" title="Error" icon={<IconAlertCircle />}>
                    Failed to load booking details. The link may be invalid or expired.
                </Alert>
            </Container>
        );
    }

    if (!booking) {
        return (
            <Container size="sm" my="xl" style={{ textAlign: 'center' }}>
                <Loader />
                <Text mt="md">Loading booking details...</Text>
            </Container>
        );
    }

    return (
        <Container size="sm" my="xl">
            <Paper withBorder shadow="md" p="xl" radius="md">
                <Title order={2} ta="center">Booking Pending</Title>
                <Text c="dimmed" ta="center" mb="lg">
                    Your booking is saved, but is awaiting payment.
                </Text>

                <Text><strong>Service:</strong> {booking.serviceName}</Text>
                <Text><strong>Date:</strong> {new Date(booking.date).toLocaleDateString()}</Text>
                <Text><strong>Amount:</strong> ₦{booking.paymentAmount.toLocaleString()}</Text>

                <Button fullWidth mt="xl" onClick={handleRetryPayment} loading={loading}>
                    Pay Now
                </Button>
            </Paper>
        </Container>
    );
}
