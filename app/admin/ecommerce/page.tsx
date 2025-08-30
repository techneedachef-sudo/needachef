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
  Tabs,
  ActionIcon,
  Tooltip,
} from "@mantine/core";
import { IconShoppingCart, IconPackage, IconAlertCircle, IconTruckDelivery, IconCheck } from "@tabler/icons-react";
import { ProductsTab } from "@/components/admin/ProductsTab";

interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  total: number;
  status: "Pending" | "Paid" | "Shipped" | "Delivered";
  date: string;
  itemCount: number;
}

const statusColors: Record<Order["status"], string> = {
  Pending: "yellow",
  Paid: "cyan",
  Shipped: "blue",
  Delivered: "green",
};

export default function EcommerceManagementPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/orders");
      if (!res.ok) throw new Error("Failed to fetch orders.");
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

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (id: string, status: Order["status"]) => {
    const originalOrders = [...orders];
    setOrders(ords => ords.map(ord => ord.id === id ? { ...ord, status } : ord));

    try {
      const response = await fetch(`/api/admin/orders`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      if (!response.ok) throw new Error('Failed to update status.');
    } catch {
      setOrders(originalOrders);
      setError("Could not update order status. Please try again.");
    }
  };

  const orderRows = orders.map((row) => (
    <Table.Tr key={row.id}>
      <Table.Td style={{ minWidth: '150px' }}>{row.id}</Table.Td>
      <Table.Td style={{ minWidth: '150px' }}>{row.customerName}</Table.Td>
      <Table.Td style={{ minWidth: '100px' }}>${(row.total / 100).toFixed(2)}</Table.Td>
      <Table.Td style={{ minWidth: '100px' }}>
        <Badge color={statusColors[row.status]} variant="light">
          {row.status}
        </Badge>
      </Table.Td>
      <Table.Td style={{ minWidth: '120px' }}>{new Date(row.date).toLocaleDateString()}</Table.Td>
      <Table.Td style={{ minWidth: '150px' }}>
        <Tooltip label="Mark as Shipped">
          <ActionIcon variant="subtle" color="blue" onClick={() => handleUpdateStatus(row.id, 'Shipped')}>
            <IconTruckDelivery size={16} />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="Mark as Delivered">
          <ActionIcon variant="subtle" color="green" onClick={() => handleUpdateStatus(row.id, 'Delivered')}>
            <IconCheck size={16} />
          </ActionIcon>
        </Tooltip>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Container fluid>
      <Title order={2}>eCommerce Management</Title>
      <Text c="dimmed">Oversee orders and manage products.</Text>

      <Tabs defaultValue="orders" mt="lg">
        <Tabs.List>
          <Tabs.Tab value="orders" leftSection={<IconShoppingCart size={16} />}>
            Orders
          </Tabs.Tab>
          <Tabs.Tab value="products" leftSection={<IconPackage size={16} />}>
            Products
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="orders" pt="xl">
          {loading && <Loader my="xl" />}
          {error && <Alert color="red" title="Error" icon={<IconAlertCircle />} my="xl">{error}</Alert>}
          {!loading && !error && (
            <ScrollArea>
              <Table miw={700} verticalSpacing="sm">
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th style={{ minWidth: '150px' }}>Order ID</Table.Th>
                    <Table.Th style={{ minWidth: '150px' }}>Customer</Table.Th>
                    <Table.Th style={{ minWidth: '100px' }}>Total</Table.Th>
                    <Table.Th style={{ minWidth: '100px' }}>Status</Table.Th>
                    <Table.Th style={{ minWidth: '120px' }}>Date</Table.Th>
                    <Table.Th style={{ minWidth: '150px' }}>Actions</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>{orderRows.length > 0 ? orderRows : <Table.Tr><Table.Td colSpan={6}><Text ta="center">No orders found.</Text></Table.Td></Table.Tr>}</Table.Tbody>
              </Table>
            </ScrollArea>
          )}
        </Tabs.Panel>
        
        <Tabs.Panel value="products" pt="xl">
          <ProductsTab />
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
}
