import { Suspense } from 'react';
import LoginClientPage from './LoginClientPage';
import { Loader, Container } from '@mantine/core';

export default function LoginPage() {
  return (
    <Suspense fallback={
      <Container size="sm" my="xl" style={{ textAlign: 'center' }}>
        <Loader />
      </Container>
    }>
      <LoginClientPage />
    </Suspense>
  );
}
