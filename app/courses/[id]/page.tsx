import { Suspense } from 'react';
import CourseDetailClientPage from './CourseDetailClientPage';
import { Loader, Container } from '@mantine/core';

export default function CourseDetailPage() {
  return (
    <Suspense fallback={
      <Container size="sm" my="xl" style={{ textAlign: 'center' }}>
        <Loader />
      </Container>
    }>
      <CourseDetailClientPage />
    </Suspense>
  );
}