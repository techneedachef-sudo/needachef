import { Suspense } from 'react';
import PendingBookingClientPage from './PendingBookingClientPage';
import { Loader, Container } from '@mantine/core';

export default function PendingBookingPage() {
  return (
    <Suspense fallback={
      <Container size="sm" my="xl" style={{ textAlign: 'center' }}>
        <Loader />
      </Container>
    }>
      <PendingBookingClientPage />
    </Suspense>
  );
}