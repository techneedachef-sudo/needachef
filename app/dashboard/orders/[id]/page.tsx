"use client";

import { useEffect, useState } from "react";
import {
  Container,
  Title,
  Text,
  Loader,
  Alert,
  Paper,
  Group,
  Badge,
  Table,
  Divider,
  Anchor,
  Breadcrumbs,
} from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import Link from "next/link";
import { useParams } from "next/navigation";

interface OrderItem {
    name: string;
    quantity: number;
    price: number; // Price per item
}

interface Order {
  id: string;
  total: number;
  status: "Pending" | "Shipped" | "Delivered";
  date: string;
  items: OrderItem[];
  customerName: string;
  customerEmail: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
}

const statusColors: Record<Order["status"], string> = {
  Pending: "yellow",
  Shipped: "blue",
  Delivered: "green",
};

export default function OrderDetailsPage() {
  const params = useParams();
  const orderId = params.id as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/orders/${orderId}`);
        if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.error || `Failed to fetch order details.`);
        }
        const data = await res.json();
        setOrder(data);
      } catch (err) {
        if (err instanceof Error) {
            setError(err.message);
        } else {
            setError("An unknown error occurred.");
        }
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
        fetchOrderDetails();
    }
  }, [orderId]);

  const itemRows = order?.items.map((item, index) => (
    <Table.Tr key={index}>
      <Table.Td style={{ minWidth: '150px' }}>{item.name}</Table.Td>
      <Table.Td style={{ minWidth: '100px' }}>{item.quantity}</Table.Td>
      <Table.Td style={{ minWidth: '120px' }}>${((item.price || 0) / 100).toFixed(2)}</Table.Td>
      <Table.Td style={{ minWidth: '120px' }}>${((item.quantity * (item.price || 0)) / 100).toFixed(2)}</Table.Td>
    </Table.Tr>
  ));

  const breadcrumbs = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'My Orders', href: '/dashboard/orders' },
    { title: order?.id || 'Order Details', href: `/dashboard/orders/${orderId}` },
  ].map((item, index) => (
    <Anchor component={Link} href={item.href} key={index}>
      {item.title}
    </Anchor>
  ));

  return (
    <Container fluid>
      <Breadcrumbs my="lg">{breadcrumbs}</Breadcrumbs>
      <Title order={2}>Order Details</Title>
      
      {loading && <Loader my="xl" />}
      {error && <Alert color="red" title="Error" icon={<IconAlertCircle />} my="xl">{error}</Alert>}

      {!loading && order && (
        <Paper withBorder p="xl" radius="md" mt="xl">
            <Group justify="space-between">
                <div>
                    <Title order={3}>Order #{order.id}</Title>
                    <Text c="dimmed">Date: {new Date(order.date).toLocaleDateString()}</Text>
                </div>
                <Badge color={statusColors[order.status]} size="lg" variant="light">
                    {order.status}
                </Badge>
            </Group>

            <Divider my="xl" />

            <div>
                <Title order={4} mb="md">Shipping Address</Title>
                <Text>{order.shippingAddress.street}</Text>
                <Text>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}</Text>
            </div>

            <Divider my="xl" />

            <Title order={4} mb="md">Items</Title>
            <Table>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th style={{ minWidth: '150px' }}>Product</Table.Th>
                        <Table.Th style={{ minWidth: '100px' }}>Quantity</Table.Th>
                        <Table.Th style={{ minWidth: '120px' }}>Unit Price</Table.Th>
                        <Table.Th style={{ minWidth: '120px' }}>Total</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>{itemRows}</Table.Tbody>
            </Table>

            <Group justify="flex-end" mt="md">
                <Title order={4}>Total: ${(order.total / 100).toFixed(2)}</Title>
            </Group>
        </Paper>
      )}
    </Container>
  );
}