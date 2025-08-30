"use client";

import { Container, Title, Text, Button, Paper, Group } from "@mantine/core";
import { IconCircleCheck } from "@tabler/icons-react";
import Link from "next/link";
import { Suspense, useEffect } from "react";
import { useCart } from "@/components/cart/CartContext";

function PaymentSuccessContent() {
  const { dispatch } = useCart();

  useEffect(() => {
    // Clear the cart only when this component mounts after a successful payment
    dispatch({ type: 'CLEAR_CART' });
  }, [dispatch]);

  return (
    <Container size="sm" my={40}>
      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <div style={{ display: "flex", justifyContent: "center" }}>
          <IconCircleCheck size={64} color="green" />
        </div>
        <Title ta="center" mt="md">
          Payment Successful!
        </Title>
        <Text c="dimmed" size="lg" ta="center" mt="sm">
          Thank you for your purchase. A confirmation email has been sent to you.
        </Text>
        
        <Group justify="center" mt="xl">
            <Button
              component={Link}
              href="/dashboard/orders"
              variant="outline"
            >
              View Your Orders
            </Button>
            <Button component={Link} href="/">
              Back to Homepage
            </Button>
        </Group>
      </Paper>
    </Container>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
