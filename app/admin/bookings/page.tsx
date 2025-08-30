"use client";

import { useState } from "react";
import { Container, Title, Text, Paper, Table, Badge, ScrollArea, Center, Box, Button, Modal, Group, Divider, Loader, Alert, Stack, SimpleGrid, Select } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import useSWR, { useSWRConfig } from 'swr';
import { IconAlertCircle, IconUser, IconToolsKitchen2, IconCalendarEvent, IconInfoCircle } from "@tabler/icons-react";
import { handleApiError } from "@/utils/errorHandler";
import { showSuccessNotification } from "@/utils/successHandler";

// --- Interfaces ---
interface Booking {
    id: string;
    userName: string;
    serviceName: string;
    chefName: string | null;
    date: string;
    time?: string;
    status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
    location?: string;
    guests?: number;
    eventType?: string;
    cuisinePreferences?: string[];
    dietaryRestrictions?: string;
    kitchenEquipment?: string[];
    details?: string;
    chefId?: string | null;
}

interface Chef {
    id: string;
    name: string;
}

const statusColors: Record<Booking['status'], string> = {
    PENDING: "yellow",
    CONFIRMED: "blue",
    COMPLETED: "green",
    CANCELLED: "red",
};

const fetcher = (url: string) => fetch(url).then(res => {
    if (!res.ok) {
        throw new Error('Failed to fetch data');
    }
    return res.json();
});

// --- Main Component ---
export default function AdminBookingsPage() {
    const { data: bookings, error: bookingsError, isLoading: bookingsLoading } = useSWR<Booking[]>('/api/admin/bookings', fetcher);
    const { data: chefs, error: chefsError, isLoading: chefsLoading } = useSWR<Chef[]>('/api/admin/chefs', fetcher);
    
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [opened, { open, close }] = useDisclosure(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const { mutate } = useSWRConfig();

    const [selectedChefId, setSelectedChefId] = useState<string | null>(null);
    const [selectedStatus, setSelectedStatus] = useState<Booking['status'] | null>(null);

    const handleViewDetails = (booking: Booking) => {
        setSelectedBooking(booking);
        setSelectedChefId(booking.chefId || null);
        setSelectedStatus(booking.status);
        open();
    };

    const handleUpdateBooking = async () => {
        if (!selectedBooking) return;
        setIsUpdating(true);
        try {
            const response = await fetch(`/api/admin/bookings/${selectedBooking.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chefId: selectedChefId,
                    status: selectedStatus,
                }),
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || "Failed to update booking.");
            }

            // Optimistically update the local data
            mutate('/api/admin/bookings', (currentData: Booking[] | undefined) => {
                if (!currentData) return [];
                return currentData.map(b => 
                    b.id === selectedBooking.id 
                    ? { ...b, chefId: selectedChefId, status: selectedStatus!, chefName: chefs?.find(c => c.id === selectedChefId)?.name || null } 
                    : b
                );
            }, false);

            showSuccessNotification("Booking updated successfully!");
            close();

        } catch (error) {
            handleApiError(error);
        } finally {
            setIsUpdating(false);
        }
    };

    const rows = bookings?.map((row) => (
        <Table.Tr key={row.id}>
            <Table.Td>{row.id}</Table.Td>
            <Table.Td>{row.userName}</Table.Td>
            <Table.Td>{row.serviceName}</Table.Td>
            <Table.Td>{row.chefName || <Badge color="gray">Unassigned</Badge>}</Table.Td>
            <Table.Td>{new Date(row.date).toLocaleDateString()}</Table.Td>
            <Table.Td>
                <Badge color={statusColors[row.status]} variant="light">
                    {row.status}
                </Badge>
            </Table.Td>
            <Table.Td>
                <Button variant="light" size="xs" onClick={() => handleViewDetails(row)}>
                    Manage
                </Button>
            </Table.Td>
        </Table.Tr>
    ));

    const isLoading = bookingsLoading || chefsLoading;
    const error = bookingsError || chefsError;

    return (
        <>
            <Container fluid>
                <Title order={2} mb="xl">Manage Bookings</Title>
                {isLoading && <Center><Loader /></Center>}
                {error && <Alert color="red" title="Error" icon={<IconAlertCircle />}>Failed to load data. Please try refreshing the page.</Alert>}
                
                {!isLoading && !error && (!bookings || bookings.length === 0) ? (
                    <Paper withBorder p="xl" radius="md" style={{ textAlign: 'center' }}>
                        <Text size="xl" fw={500} mt="md">No Bookings Found</Text>
                    </Paper>
                ) : (
                    <Paper withBorder radius="md">
                        <ScrollArea>
                            <Table miw={900} verticalSpacing="sm">
                                <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>Booking ID</Table.Th>
                                    <Table.Th>User</Table.Th>
                                    <Table.Th>Service</Table.Th>
                                    <Table.Th>Assigned Chef</Table.Th>
                                    <Table.Th>Date</Table.Th>
                                    <Table.Th>Status</Table.Th>
                                    <Table.Th>Actions</Table.Th>
                                </Table.Tr>
                                </Table.Thead>
                                <Table.Tbody>{rows}</Table.Tbody>
                            </Table>
                        </ScrollArea>
                    </Paper>
                )}
            </Container>

            <Modal opened={opened} onClose={close} title={`Manage Booking: ${selectedBooking?.id}`} size="lg" centered>
                {selectedBooking && (
                    <Stack gap="md" p="md">
                        {/* --- Management Section --- */}
                        <Paper withBorder p="md" radius="sm">
                            <Title order={4} mb="md">Admin Controls</Title>
                            <SimpleGrid cols={2} spacing="md">
                                <Select
                                    label="Booking Status"
                                    value={selectedStatus}
                                    onChange={(value) => setSelectedStatus(value as Booking['status'])}
                                    data={Object.keys(statusColors).map(s => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() }))}
                                    disabled={isUpdating}
                                />
                                <Select
                                    label="Assign Chef"
                                    placeholder="Select a chef"
                                    value={selectedChefId}
                                    onChange={setSelectedChefId}
                                    data={chefs?.map(chef => ({ value: chef.id, label: chef.name })) || []}
                                    searchable
                                    clearable
                                    disabled={isUpdating || chefsLoading}
                                />
                            </SimpleGrid>
                            <Group justify="flex-end" mt="xl">
                                <Button variant="default" onClick={close} disabled={isUpdating}>Cancel</Button>
                                <Button onClick={handleUpdateBooking} loading={isUpdating}>Save Changes</Button>
                            </Group>
                        </Paper>
                        
                        <Divider my="sm" label="Booking Details" labelPosition="center" />

                        {/* --- Details Section --- */}
                        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xs">
                            <Group><IconUser size={16} /><Text fw={700}>User:</Text></Group><Text>{selectedBooking?.userName}</Text>
                            <Group><IconToolsKitchen2 size={16} /><Text fw={700}>Service:</Text></Group><Text>{selectedBooking?.serviceName}</Text>
                            <Group><IconCalendarEvent size={16} /><Text fw={700}>Event Type:</Text></Group><Text>{selectedBooking?.eventType || 'N/A'}</Text>
                            <Group><IconCalendarEvent size={16} /><Text fw={700}>Date & Time:</Text></Group><Text>{`${new Date(selectedBooking.date).toLocaleDateString()} at ${selectedBooking?.time || 'N/A'}`}</Text>
                            <Group><IconInfoCircle size={16} /><Text fw={700}>Location:</Text></Group><Text>{selectedBooking?.location || 'N/A'}</Text>
                            <Group><IconInfoCircle size={16} /><Text fw={700}>Guests:</Text></Group><Text>{selectedBooking?.guests ?? 'N/A'}</Text>
                        </SimpleGrid>
                        <Divider my="xs" />
                        <Title order={5}>Food & Kitchen Details</Title>
                        <Text><strong>Cuisine Preferences:</strong> {selectedBooking?.cuisinePreferences?.join(', ') || 'N/A'}</Text>
                        <Text><strong>Dietary Restrictions:</strong> {selectedBooking?.dietaryRestrictions || 'None'}</Text>
                        <Text><strong>Kitchen Equipment:</strong> {selectedBooking?.kitchenEquipment?.join(', ') || 'N/A'}</Text>
                        <Text><strong>Additional Details:</strong> {selectedBooking?.details || 'None'}</Text>
                    </Stack>
                )}
            </Modal>
        </>
    );
}
