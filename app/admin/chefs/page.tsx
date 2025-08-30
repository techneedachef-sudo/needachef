"use client";

import { useEffect, useState } from "react";
import {
  Container,
  Title,
  Text,
  Table,
  ScrollArea,
  Button,
  Group,
  Loader,
  Alert,
  Badge,
  ActionIcon,
  Modal,
  Tabs,
  Stack,
  SimpleGrid,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconEye, IconCheck, IconX, IconAlertCircle, IconUsers, IconUserCheck } from "@tabler/icons-react";
import { AnimatedDivider } from "@/components/general/AnimatedDivider";
import { ChefApplicationStatus } from "@/app/generated/prisma";
import { useAuth } from "@/components/auth/AuthProvider";
import Link from "next/link";

// --- Interfaces ---
interface Application {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  chefLevel: string;
  experience: string;
  status: ChefApplicationStatus;
  bio?: string;
  resume?: string;
}

interface Chef {
    id: string;
    name: string;
    email: string;
    // Add other relevant chef details here in the future
}

// --- Constants ---
const statusColors: Record<ChefApplicationStatus, string> = {
  PENDING: "yellow",
  REVIEWED: "blue",
  APPROVED: "green",
  DENIED: "red",
};

// --- Child Components ---

function ApplicationsTab() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);
  const { mutate: mutateUser } = useAuth();

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/applications");
      if (!res.ok) throw new Error("Failed to fetch applications.");
      const data = await res.json();
      setApplications(data);
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
    fetchApplications();
  }, []);

  const handleUpdateStatus = async (id: string, status: Application["status"]) => {
    const originalApps = [...applications];
    setApplications(apps => apps.map(app => app.id === id ? { ...app, status } : app));

    try {
      const response = await fetch(`/api/admin/applications`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      if (!response.ok) throw new Error('Failed to update status.');
      // If the status was approved, trigger a re-fetch of user data
      if (status === 'APPROVED') {
        mutateUser(); 
      }
    } catch {
      setApplications(originalApps);
      setError("Could not update status. Please try again.");
    }
  };

  const handleViewDetails = (app: Application) => {
    setSelectedApp(app);
    openModal();
  };

  const rows = applications.map((row) => (
    <Table.Tr key={row.id}>
      <Table.Td style={{ minWidth: '150px' }}>{row.fullName}</Table.Td>
      <Table.Td style={{ minWidth: '150px' }}>{row.email}</Table.Td>
      <Table.Td style={{ minWidth: '120px' }}>{row.chefLevel}</Table.Td>
      <Table.Td style={{ minWidth: '100px' }}>
        <Badge color={statusColors[row.status]} variant="light">{row.status}</Badge>
      </Table.Td>
      <Table.Td style={{ minWidth: '150px' }}>
        <Group gap="xs">
          <ActionIcon variant="subtle" onClick={() => handleViewDetails(row)}><IconEye size={16} /></ActionIcon>
          <ActionIcon variant="subtle" color="green" onClick={() => handleUpdateStatus(row.id, 'APPROVED')}><IconCheck size={16} /></ActionIcon>
          <ActionIcon variant="subtle" color="red" onClick={() => handleUpdateStatus(row.id, 'DENIED')}><IconX size={16} /></ActionIcon>
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <>
      {loading && <Loader my="xl" />}
      {error && <Alert color="red" title="Error" icon={<IconAlertCircle />} my="xl">{error}</Alert>}
      {!loading && !error && (
        <ScrollArea mt="xl">
          <Table miw={700} verticalSpacing="sm">
            <Table.Thead>
              <Table.Tr>
                <Table.Th style={{ minWidth: '150px' }}>Full Name</Table.Th>
                <Table.Th style={{ minWidth: '150px' }}>Email</Table.Th>
                <Table.Th style={{ minWidth: '120px' }}>Chef Level</Table.Th>
                <Table.Th style={{ minWidth: '100px' }}>Status</Table.Th>
                <Table.Th style={{ minWidth: '150px' }}>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>{rows.length > 0 ? rows : <Table.Tr><Table.Td colSpan={5}><Text ta="center">No applications found.</Text></Table.Td></Table.Tr>}</Table.Tbody>
          </Table>
        </ScrollArea>
      )}
      <Modal opened={modalOpened} onClose={closeModal} title="Application Details" size="lg">
        {selectedApp && (
          <Stack gap="md" p="md">
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xs">
              <Text fw={700}>Name:</Text><Text>{selectedApp.fullName}</Text>
              <Text fw={700}>Email:</Text><Text>{selectedApp.email}</Text>
              <Text fw={700}>Phone:</Text><Text>{selectedApp.phone}</Text>
              <Text fw={700}>Level:</Text><Text>{selectedApp.chefLevel}</Text>
              <Text fw={700}>Experience:</Text><Text>{selectedApp.experience} years</Text>
              <Text fw={700}>Status:</Text><Text><Badge color={statusColors[selectedApp.status]} variant="light">{selectedApp.status}</Badge></Text>
            </SimpleGrid>

            <AnimatedDivider size="md" />

            <Text fw={700}>Bio:</Text>
            <Text style={{ whiteSpace: 'pre-wrap' }}>{selectedApp.bio || "N/A"}</Text>

            {selectedApp.resume && (
              <Button 
                component="a" 
                href={selectedApp.resume} 
                target="_blank" 
                rel="noopener noreferrer"
                variant="outline"
                mt="md"
              >
                View Resume
              </Button>
            )}
          </Stack>
        )}
      </Modal>
    </>
  );
}

interface UserWithRole {
    id: string;
    name: string;
    email: string;
    role: string;
}

function ActiveChefsTab() {
    const [chefs, setChefs] = useState<Chef[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchChefs = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/admin/users');
            if (!res.ok) throw new Error('Failed to fetch users.');
            const users: UserWithRole[] = await res.json();
            setChefs(users.filter((user) => user.role === 'CHEF'));
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
        fetchChefs();
    }, []);

    const rows = chefs.map((row) => (
        <Table.Tr key={row.id}>
            <Table.Td style={{ minWidth: '150px' }}>{row.name}</Table.Td>
            <Table.Td style={{ minWidth: '150px' }}>{row.email}</Table.Td>
            <Table.Td style={{ minWidth: '150px' }}>
                <Button component={Link} href={`/admin/chefs/${row.id}`} variant="light" size="xs">View Profile</Button>
            </Table.Td>
        </Table.Tr>
    ));

    return (
        <>
            {loading && <Loader my="xl" />}
            {error && <Alert color="red" title="Error" icon={<IconAlertCircle />} my="xl">{error}</Alert>}
            {!loading && !error && (
                <ScrollArea mt="xl">
                    <Table miw={700} verticalSpacing="sm">
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th style={{ minWidth: '150px' }}>Name</Table.Th>
                                <Table.Th style={{ minWidth: '150px' }}>Email</Table.Th>
                                <Table.Th style={{ minWidth: '150px' }}>Actions</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>{rows.length > 0 ? rows : <Table.Tr><Table.Td colSpan={3}><Text ta="center">No active chefs found.</Text></Table.Td></Table.Tr>}</Table.Tbody>
                    </Table>
                </ScrollArea>
            )}
        </>
    );
}


// --- Main Page Component ---
export default function ChefManagementPage() {
  return (
    <Container fluid>
      <Title order={2}>Chef Management</Title>
      <Text c="dimmed">Review applications and manage active chefs.</Text>

      <Tabs defaultValue="applications" mt="lg">
        <Tabs.List>
          <Tabs.Tab value="applications" leftSection={<IconUsers size={16} />}>
            Applications
          </Tabs.Tab>
          <Tabs.Tab value="active_chefs" leftSection={<IconUserCheck size={16} />}>
            Active Chefs
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="applications" pt="sm">
          <ApplicationsTab />
        </Tabs.Panel>
        
        <Tabs.Panel value="active_chefs" pt="sm">
          <ActiveChefsTab />
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
}
