"use client";

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Container, Loader, Title, Text, Paper, Button, Alert } from '@mantine/core';
import { IconCheck, IconX, IconAlertCircle } from '@tabler/icons-react';

export default function VerifyBookingClientPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const ref = searchParams.get('ref');
    const [status, setStatus] = useState<'loading' | 'success' | 'failed' | 'error'>('loading');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!ref) {
            setStatus('error');
            setError("No payment reference found.");
            return;
        }

        const verifyPayment = async () => {
            try {
                const response = await fetch(`/api/booking/verify-payment?ref=${ref}`);
                if (!response.ok) {
                    const err = await response.json();
                    throw new Error(err.error || "Verification failed.");
                }
                const data = await response.json();
                setStatus(data.status === 'success' ? 'success' : 'failed');
            } catch (e: any) {
                setStatus('error');
                setError(e.message);
            }
        };

        verifyPayment();
    }, [ref]);

    return (
        <Container size="sm" my="xl">
            <Paper withBorder shadow="md" p="xl" radius="md" style={{ textAlign: 'center' }}>
                {status === 'loading' && (
                    <>
                        <Loader size="xl" mx="auto" />
                        <Title order={2} mt="lg">Verifying your booking...</Title>
                        <Text c="dimmed">Please wait, this won&apos;t take long.</Text>
                    </>
                )}
                {status === 'success' && (
                    <>
                        <IconCheck size={80} color="green" style={{ margin: '0 auto' }} />
                        <Title order={2} mt="lg">Booking Confirmed!</Title>
                        <Text>Your payment was successful and your booking is confirmed. You will receive a confirmation email shortly.</Text>
                        <Button mt="xl" onClick={() => router.push('/dashboard/bookings')}>
                            View My Bookings
                        </Button>
                    </>
                )}
                {status === 'failed' && (
                    <>
                        <IconX size={80} color="red" style={{ margin: '0 auto' }} />
                        <Title order={2} mt="lg">Payment Failed</Title>
                        <Text>Unfortunately, we could not confirm your payment. Your booking has been saved with a pending status.</Text>
                        <Button mt="xl" onClick={() => router.push(`/booking/pending?ref=${ref}`)}>
                            View Booking and Retry
                        </Button>
                    </>
                )}
                {status === 'error' && (
                     <Alert color="red" title="An Error Occurred" icon={<IconAlertCircle />}>
                        {error || "Something went wrong during verification. Please contact support."}
                    </Alert>
                )}
            </Paper>
        </Container>
    );
}
