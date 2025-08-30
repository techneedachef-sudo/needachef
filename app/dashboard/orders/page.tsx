"use client";

import { useEffect, useState } from "react";
import {
  Container,
  Title,
  Text,
  Table,
  ScrollArea,
  Loader,
  Alert,
  Badge,
  Paper,
  Button,
  Box,
  Center,
  ActionIcon,
} from "@mantine/core";
import { IconAlertCircle, IconPackage, IconEye } from "@tabler/icons-react";
import { useAuth } from "@/components/auth/AuthProvider";
import Link from "next/link";

interface Order {
  id: string;
  total: number;
  status: "Pending" | "Shipped" | "Delivered";
  date: string;
}

const statusColors: Record<Order["status"], string> = {
  Pending: "yellow",
  Shipped: "blue",
  Delivered: "green",
};

export default function MyOrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      const fetchOrders = async () => {
        try {
          setLoading(true);
          setError(null);
          const res = await fetch("/api/orders");
          if (!res.ok) throw new Error("Failed to fetch your orders.");
          const data = await res.json();
          setOrders(data);
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
      fetchOrders();
    }
  }, [user]);

  const rows = orders.map((row) => (
    <Table.Tr key={row.id}>
      <Table.Td style={{ minWidth: '150px' }}>{row.id}</Table.Td>
      <Table.Td style={{ minWidth: '120px' }}>{new Date(row.date).toLocaleDateString()}</Table.Td>
      <Table.Td style={{ minWidth: '100px' }}>${(row.total / 100).toFixed(2)}</Table.Td>
      <Table.Td style={{ minWidth: '100px' }}>
        <Badge color={statusColors[row.status]} variant="light">
          {row.status}
        </Badge>
      </Table.Td>
      <Table.Td style={{ minWidth: '150px' }}>
        <ActionIcon component={Link} href={`/dashboard/orders/${row.id}`} variant="subtle">
            <IconEye size={16} />
        </ActionIcon>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Container fluid>
      <Title order={2} mb="xl">My Orders</Title>
      
      {loading && <Loader my="xl" />}
      {error && <Alert color="red" title="Error" icon={<IconAlertCircle />} my="xl">{error}</Alert>}

      {!loading && !error && (
        orders.length === 0 ? (
            <Paper withBorder p="xl" radius="md">
                <Center>
                    <Box ta="center" className="justify-center flex flex-col">
                        <IconPackage size={48} stroke={1.5} className="self-center" />
                        <Text size="xl" fw={500} mt="md">No Orders Found</Text>
                        <Text c="dimmed" mt="sm">You haven&apos;t made any purchases yet.</Text>
                        <Button component={Link} href="/shop" mt="xl">
                            Go to Shop
                        </Button>
                    </Box>
                </Center>
            </Paper>
        ) : (
            <Paper withBorder radius="md">
                <ScrollArea>
                    <Table miw={700} verticalSpacing="sm">
                        <Table.Thead>
                        <Table.Tr>
                            <Table.Th style={{ minWidth: '150px' }}>Order ID</Table.Th>
                            <Table.Th style={{ minWidth: '120px' }}>Date</Table.Th>
                            <Table.Th style={{ minWidth: '100px' }}>Total</Table.Th>
                            <Table.Th style={{ minWidth: '100px' }}>Status</Table.Th>
                            <Table.Th style={{ minWidth: '150px' }}>Actions</Table.Th>
                        </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>{rows}</Table.Tbody>
                    </Table>
                </ScrollArea>
            </Paper>
        )
      )}
    </Container>
  );
}
