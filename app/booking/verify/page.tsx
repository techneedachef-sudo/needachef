import { Suspense } from 'react';
import VerifyBookingClientPage from './VerifyBookingClientPage';
import { Loader, Container } from '@mantine/core';

export default function VerifyBookingPage() {
  return (
    <Suspense fallback={
      <Container size="sm" my="xl" style={{ textAlign: 'center' }}>
        <Loader />
      </Container>
    }>
      <VerifyBookingClientPage />
    </Suspense>
  );
}