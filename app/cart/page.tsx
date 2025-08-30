"use client";

import {
  Container,
  Title,
  Grid,
  Paper,
  Text,
  Button,
  Group,
  Image,
  ActionIcon,
  NumberInput,
  Divider,
  Center,
  Stack,
  Box,
} from "@mantine/core";
import { IconTrash, IconShoppingCart } from "@tabler/icons-react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useCart } from "@/components/cart/CartContext";
import { useState } from "react";
import { handleApiError } from "@/utils/errorHandler";
import Script from "next/script";
import { useRouter } from "next/navigation";

declare global {
    interface Window {
        PaystackPop: any;
    }
}

export default function CartPage() {
  const { state, dispatch } = useCart();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleQuantityChange = (id: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
  };

  const handleRemoveItem = (id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { id } });
  };

  const subtotal = state.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const tax = subtotal * 0.05; // 5% tax
  const total = subtotal + tax;

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: state.items }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.details || 'Failed to create checkout session.');
      }

      const { reference, email, amount, access_code } = await response.json();
      
      const handler = window.PaystackPop.setup({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!,
        email: email,
        amount: amount * 100, // Amount from backend is in Naira, convert to kobo
        ref: access_code, // Use access_code here
        onClose: function(){
          // User closed the popup
          setLoading(false);
        },
        callback: function(response: any){
          // Payment successful
          // The webhook will handle the order update, so we just redirect.
          router.push(`/payment-success?ref=${response.reference}`);
        }
      });

      handler.openIframe();

    } catch (error) {
      handleApiError(error);
      setLoading(false);
    }
  };

  return (
    <>
      <Script src="https://js.paystack.co/v1/inline.js" />
      <Header />
      <Container size="lg" my="xl">
        <Title order={1} mb="xl">Your Shopping Cart</Title>
        {state.items.length === 0 ? (
          <Paper withBorder p="xl" radius="md">
            <Center>
              <Stack ta="center" align="center" gap="xs">
                <IconShoppingCart size={48} stroke={1.5} />
                <Text size="xl" fw={500} mt="md">Your cart is empty</Text>
                <Text c="dimmed" mt="sm">You haven&apos;t added any items to your cart yet.</Text>
                <Button component={Link} href="/shop" mt="xl">
                  Start Shopping
                </Button>
              </Stack>
            </Center>
          </Paper>
        ) : (
          <Grid gutter="xl">
            <Grid.Col span={{ base: 12, md: 8 }}>
              <Paper withBorder p="md" radius="md">
                {state.items.map((item) => (
                  <Box key={item.id}>
                    <Group justify="space-between" align="flex-start">
                      <Group>
                        <Image src={item.image} alt={item.name} width={80} height={80} radius="sm" />
                        <div>
                          <Text fw={500}>{item.name}</Text>
                          <Text size="sm" c="dimmed">₦{(item.price / 100).toFixed(2)}</Text>
                        </div>
                      </Group>
                      <Group>
                        <NumberInput
                          value={item.quantity}
                          onChange={(value) => handleQuantityChange(item.id, Number(value))}
                          min={1}
                          max={99}
                          style={{ width: 70 }}
                        />
                        <ActionIcon color="red" onClick={() => handleRemoveItem(item.id)}>
                          <IconTrash size={18} />
                        </ActionIcon>
                      </Group>
                    </Group>
                    <Divider my="md" />
                  </Box>
                ))}
              </Paper>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Paper withBorder p="xl" radius="md">
                <Title order={3}>Order Summary</Title>
                <Group justify="space-between" mt="lg">
                  <Text>Subtotal</Text>
                  <Text>₦{(subtotal / 100).toFixed(2)}</Text>
                </Group>
                <Group justify="space-between" mt="sm">
                  <Text>Tax (5%)</Text>
                  <Text>₦{(tax / 100).toFixed(2)}</Text>
                </Group>
                <Divider my="md" />
                <Group justify="space-between">
                  <Text fw={700} size="lg">Total</Text>
                  <Text fw={700} size="lg">₦{(total / 100).toFixed(2)}</Text>
                </Group>
                <Button fullWidth mt="xl" onClick={handleCheckout} loading={loading}>
                  Proceed to Checkout
                </Button>
              </Paper>
            </Grid.Col>
          </Grid>
        )}
      </Container>
      <Footer />
    </>
  );
}
