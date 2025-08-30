"use client";

import { useEffect, useState } from "react";
import {
  Container,
  Title,
  Text as MantineText,
  Table,
  ScrollArea,
  Loader,
  Alert,
  Badge,
  Paper,
  Tabs,
  Button,
  TextInput,
  Group,
  Center,
  Stack,
  Modal,
  Select,
  Divider,
  SimpleGrid,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { IconAlertCircle, IconCalendar, IconToolsKitchen2, IconCheck, IconUser, IconInfoCircle } from "@tabler/icons-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { notifications } from "@mantine/notifications";
import { CreatableMultiSelect } from "@/components/general/CreatableMultiSelect";
import { handleApiError } from "@/utils/errorHandler";
import { showSuccessNotification } from "@/utils/successHandler";
import useSWR, { useSWRConfig } from 'swr';

// --- Interfaces ---
interface Booking {
  id: string;
  serviceName: string;
  date: string;
  time: string;
  location: string;
  guests: number;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  customerName: string;
  eventType?: string;
  cuisinePreferences?: string[];
  dietaryRestrictions?: string;
  kitchenEquipment?: string[];
  details?: string;
}

// --- Constants ---
const statusColors: Record<Booking['status'], string> = {
  PENDING: "gray",
  CONFIRMED: "blue",
  COMPLETED: "green",
  CANCELLED: "red",
};

const fetcher = (url: string) => fetch(url).then(res => res.json());

// --- Child Components ---

function BookingsTab() {
    const { data: bookings, error, isLoading } = useSWR<Booking[]>('/api/chef/bookings', fetcher);
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [opened, { open, close }] = useDisclosure(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState<Booking['status'] | null>(null);
    const { mutate } = useSWRConfig();

    const handleViewDetails = (booking: Booking) => {
        setSelectedBooking(booking);
        setSelectedStatus(booking.status);
        open();
    };

    const handleStatusUpdate = async () => {
        if (!selectedBooking || !selectedStatus) return;
        setIsUpdating(true);
        try {
            const response = await fetch(`/api/chef/bookings/${selectedBooking.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: selectedStatus }),
            });
            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || "Failed to update status.");
            }
            mutate('/api/chef/bookings'); // Re-fetch bookings data
            showSuccessNotification("Booking status updated successfully!");
            close();
        } catch (error) {
            handleApiError(error);
        } finally {
            setIsUpdating(false);
        }
    };

    const rows = bookings?.map((row) => (
        <Table.Tr key={row.id}>
          <Table.Td>{row.customerName || 'N/A'}</Table.Td>
          <Table.Td>{row.serviceName}</Table.Td>
          <Table.Td>{new Date(row.date).toLocaleDateString()}</Table.Td>
          <Table.Td>{row.guests}</Table.Td>
          <Table.Td>
            <Badge color={statusColors[row.status]} variant="light">{row.status}</Badge>
          </Table.Td>
          <Table.Td>
            <Button variant="light" size="xs" onClick={() => handleViewDetails(row)}>
                View Details
            </Button>
          </Table.Td>
        </Table.Tr>
      ));

    return (
        <>
            {isLoading && <Loader my="xl" />}
            {error && <Alert color="red" title="Error" icon={<IconAlertCircle />} my="xl">Failed to load bookings.</Alert>}
            {!isLoading && !error && (
                bookings?.length === 0 ? (
                    <Paper withBorder p="xl" radius="md" mt="md">
                        <Center>
                            <Stack ta="center" justify="center" gap="xs">
                                <IconCalendar size={48} stroke={1.5} className="self-center"/>
                                <Title order={4} mt="md">No Bookings Yet</Title>
                                <MantineText c="dimmed" mt="sm">You don't have any bookings assigned to you yet.</MantineText>
                            </Stack>
                        </Center>
                    </Paper>
                ) : (
                    <Paper withBorder radius="md" mt="md">
                        <ScrollArea>
                        <Table miw={700} verticalSpacing="sm">
                            <Table.Thead>
                            <Table.Tr>
                                <Table.Th>Client</Table.Th>
                                <Table.Th>Service</Table.Th>
                                <Table.Th>Date</Table.Th>
                                <Table.Th>Guests</Table.Th>
                                <Table.Th>Status</Table.Th>
                                <Table.Th>Actions</Table.Th>
                            </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>{rows}</Table.Tbody>
                        </Table>
                        </ScrollArea>
                    </Paper>
                )
            )}

            <Modal opened={opened} onClose={close} title="Booking Details" size="lg" centered>
                {selectedBooking && (
                    <Stack>
                        <Paper withBorder p="md" radius="sm">
                            <Group justify="space-between">
                                <Title order={5}>Update Status</Title>
                                <Select
                                    value={selectedStatus}
                                    onChange={(value) => setSelectedStatus(value as Booking['status'])}
                                    data={['CONFIRMED', 'COMPLETED', 'CANCELLED'].map(s => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() }))}
                                    disabled={isUpdating}
                                />
                            </Group>
                            <Group justify="flex-end" mt="md">
                                <Button onClick={handleStatusUpdate} loading={isUpdating}>
                                    Save Status
                                </Button>
                            </Group>
                        </Paper>

                        <Divider my="sm" label="Full Details" labelPosition="center" />

                        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xs">
                            <Group><IconUser size={16} /><MantineText fw={700}>Client:</MantineText></Group><MantineText>{selectedBooking.customerName}</MantineText>
                            <Group><IconToolsKitchen2 size={16} /><MantineText fw={700}>Service:</MantineText></Group><MantineText>{selectedBooking.serviceName}</MantineText>
                            <Group><IconCalendar size={16} /><MantineText fw={700}>Event Type:</MantineText></Group><MantineText>{selectedBooking.eventType || 'N/A'}</MantineText>
                            <Group><IconCalendar size={16} /><MantineText fw={700}>Date & Time:</MantineText></Group><MantineText>{`${new Date(selectedBooking.date).toLocaleDateString()} at ${selectedBooking.time || 'N/A'}`}</MantineText>
                            <Group><IconInfoCircle size={16} /><MantineText fw={700}>Location:</MantineText></Group><MantineText>{selectedBooking.location || 'N/A'}</MantineText>
                            <Group><IconInfoCircle size={16} /><MantineText fw={700}>Guests:</MantineText></Group><MantineText>{selectedBooking.guests ?? 'N/A'}</MantineText>
                        </SimpleGrid>
                        <Divider my="xs" />
                        <Title order={5}>Food & Kitchen Details</Title>
                        <MantineText><strong>Cuisine Preferences:</strong> {selectedBooking.cuisinePreferences?.join(', ') || 'N/A'}</MantineText>
                        <MantineText><strong>Dietary Restrictions:</strong> {selectedBooking.dietaryRestrictions || 'None'}</MantineText>
                        <MantineText><strong>Kitchen Equipment:</strong> {selectedBooking.kitchenEquipment?.join(', ') || 'N/A'}</MantineText>
                        <MantineText><strong>Additional Details:</strong> {selectedBooking.details || 'None'}</MantineText>
                    </Stack>
                )}
            </Modal>
        </>
    )
}

function ProfileTab() {
    const { user, mutate } = useAuth();
    const form = useForm({
        initialValues: {
            specialties: user?.chefProfile?.specialties || [],
            yearsOfExperience: user?.chefProfile?.yearsOfExperience || 0,
        }
    });

    const handleSubmit = async (values: typeof form.values) => {
        try {
            const response = await fetch('/api/auth/me', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chefProfile: values }),
            });
            if (!response.ok) throw new Error("Failed to update profile.");
            
            showSuccessNotification("Your chef details have been saved.");
            mutate(); // Re-fetch user data
        } catch (err) {
            handleApiError(err);
        }
    };

    return (
        <Paper withBorder p="xl" radius="md" mt="md">
            <form onSubmit={form.onSubmit(handleSubmit)}>
                <Title order={4}>Manage Your Professional Details</Title>
                <CreatableMultiSelect
                    label="Culinary Specialties"
                    placeholder="Select or create specialties"
                    initialData={['Italian', 'French', 'Pastry', 'Grill', 'Nigerian', 'Vegan', 'Sushi']}
                    {...form.getInputProps('specialties')}
                />
                <TextInput
                    type="number"
                    label="Years of Experience"
                    placeholder="Enter your years of professional experience"
                    mt="md"
                    min={0}
                    {...form.getInputProps('yearsOfExperience')}
                />
                <Group justify="flex-end" mt="xl">
                    <Button type="submit">Save Chef Profile</Button>
                </Group>
            </form>
        </Paper>
    )
}

// --- Main Page Component ---
export default function ChefPanelPage() {
    const { user } = useAuth();

    if (!user) return <Center><Loader /></Center>;
    if (user.role !== 'CHEF') {
        return <Alert color="red">This panel is for chefs only.</Alert>
    }

    return (
        <Container fluid>
            <Title order={2} mb="xl">Chef Panel</Title>
            <Tabs defaultValue="bookings">
                <Tabs.List>
                    <Tabs.Tab value="bookings" leftSection={<IconCalendar size={16} />}>
                        My Bookings
                    </Tabs.Tab>
                    <Tabs.Tab value="profile" leftSection={<IconToolsKitchen2 size={16} />}>
                        My Chef Profile
                    </Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="bookings" pt="xl">
                    <BookingsTab />
                </Tabs.Panel>

                <Tabs.Panel value="profile" pt="xl">
                    <ProfileTab />
                </Tabs.Panel>
            </Tabs>
        </Container>
    );
}