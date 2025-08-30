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
  Center,
  Button,
  Stack,
  Group,
  Avatar,
} from "@mantine/core";
import { IconAlertCircle, IconCalendar } from "@tabler/icons-react";
import { useAuth } from "@/components/auth/AuthProvider";
import Link from "next/link";

interface Booking {
  id: string;
  service: {
    name: string;
  };
  chef: {
    name: string;
    profilePicture: string | null;
  } | null;
  date: string;
  time: string;
  location: string;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
}

const statusColors: Record<Booking['status'], string> = {
  PENDING: "yellow",
  CONFIRMED: "blue",
  COMPLETED: "green",
  CANCELLED: "red",
};

export default function MyBookingsPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      const fetchBookings = async () => {
        try {
          setLoading(true);
          setError(null);
          const res = await fetch("/api/bookings");
          if (!res.ok) throw new Error("Failed to fetch your bookings.");
          const data = await res.json();
          setBookings(data);
        } catch (err: any) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchBookings();
    }
  }, [user]);

  const rows = bookings.map((row) => (
    <Table.Tr key={row.id}>
      <Table.Td>{row.service?.name}</Table.Td>
      <Table.Td>
        {row.chef ? (
          <Group gap="sm">
            <Avatar src={row.chef.profilePicture} size={24} radius="xl" />
            <Text size="sm">{row.chef.name}</Text>
          </Group>
        ) : (
          <Text size="sm" c="dimmed">To be assigned</Text>
        )}
      </Table.Td>
      <Table.Td>{new Date(row.date).toLocaleDateString()}</Table.Td>
      <Table.Td>{row.time}</Table.Td>
      <Table.Td>
        <Badge color={statusColors[row.status]} variant="light">
          {row.status}
        </Badge>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Container fluid>
      <Title order={2}>My Bookings</Title>
      <Text c="dimmed" mb="xl">View the history of your service bookings.</Text>

      {loading && <Loader my="xl" />}
      {error && <Alert color="red" title="Error" icon={<IconAlertCircle />} my="xl">{error}</Alert>}

      {!loading && !error && (
        bookings.length === 0 ? (
            <Paper withBorder p="xl" radius="md">
                <Center>
                    <Stack ta="center" justify="center" gap="xs">
                        <IconCalendar size={48} stroke={1.5} className="self-center"/>
                        <Text size="xl" fw={500} mt="md">No Bookings Found</Text>
                        <Text c="dimmed" mt="sm">You haven't booked any services yet.</Text>
                        <Button component={Link} href="/services" mt="xl">
                            Browse Services
                        </Button>
                    </Stack>
                </Center>
            </Paper>
        ) : (
            <Paper withBorder radius="md">
                <ScrollArea>
                <Table miw={800} verticalSpacing="sm">
                    <Table.Thead>
                    <Table.Tr>
                        <Table.Th>Service</Table.Th>
                        <Table.Th>Assigned Chef</Table.Th>
                        <Table.Th>Date</Table.Th>
                        <Table.Th>Time</Table.Th>
                        <Table.Th>Status</Table.Th>
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
