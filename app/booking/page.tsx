"use client";

import { Suspense } from 'react';
import { Container, Title, Text, Paper } from "@mantine/core";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BookingForm } from "@/components/general/BookingForm";

export default function BookingPage() {
  return (
    <>
      <Header />
      <Container size="sm" my="xl">
        <Title order={1} ta="center">Book a Service</Title>
        <Text c="dimmed" mb="xl" ta="center">
            Let&apos;s get some details about your event.
          </Text>
        <Paper withBorder shadow="md" p="xl" radius="md">
          <Suspense fallback={<div>Loading...</div>}>
            <BookingForm />
          </Suspense>
        </Paper>
      </Container>
      <Footer />
    </>
  );
}
