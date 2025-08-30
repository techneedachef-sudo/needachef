"use client";

import { useEffect, useState } from "react";
import {
  Container,
  Title,
  Text,
  Table,
  ScrollArea,
  Group,
  Loader,
  Alert,
  Badge,
  ActionIcon,
  Modal,
  Stack,
  SimpleGrid,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconEye, IconPhoneCheck, IconMailOff, IconAlertCircle } from "@tabler/icons-react";
import { AnimatedDivider } from "@/components/general/AnimatedDivider";
import { InquiryStatus } from "@/app/generated/prisma";

interface Inquiry {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  message: string;
  status: InquiryStatus;
}

const statusColors: Record<InquiryStatus, string> = {
  NEW: "blue",
  CONTACTED: "orange",
  CLOSED: "gray",
};

export default function PartnerManagementPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/inquiries");
      if (!res.ok) throw new Error("Failed to fetch inquiries.");
      const data = await res.json();
      setInquiries(data);
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
    fetchInquiries();
  }, []);

  const handleUpdateStatus = async (id: string, status: Inquiry["status"]) => {
    const originalInquiries = [...inquiries];
    setInquiries(inqs => inqs.map(inq => inq.id === id ? { ...inq, status } : inq));

    try {
      const response = await fetch(`/api/admin/inquiries`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      if (!response.ok) throw new Error('Failed to update status.');
    } catch {
      setInquiries(originalInquiries);
      setError("Could not update status. Please try again.");
    }
  };

  const handleViewDetails = (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry);
    openModal();
  };

  const rows = inquiries.map((row) => (
    <Table.Tr key={row.id}>
      <Table.Td style={{ minWidth: '150px' }}>{row.companyName}</Table.Td>
      <Table.Td style={{ minWidth: '150px' }}>{row.contactName}</Table.Td>
      <Table.Td style={{ minWidth: '150px' }}>{row.email}</Table.Td>
      <Table.Td style={{ minWidth: '100px' }}>
        <Badge color={statusColors[row.status]} variant="light">
          {row.status}
        </Badge>
      </Table.Td>
      <Table.Td style={{ minWidth: '150px' }}>
        <Group gap="xs">
          <ActionIcon variant="subtle" onClick={() => handleViewDetails(row)}>
            <IconEye size={16} />
          </ActionIcon>
          <ActionIcon variant="subtle" color="blue" onClick={() => handleUpdateStatus(row.id, 'CONTACTED')}>
            <IconPhoneCheck size={16} />
          </ActionIcon>
          <ActionIcon variant="subtle" color="gray" onClick={() => handleUpdateStatus(row.id, 'CLOSED')}>
            <IconMailOff size={16} />
          </ActionIcon>
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Container fluid>
      <Title order={2}>Partner Management</Title>
      <Text c="dimmed">Manage and track all partnership inquiries.</Text>

      {loading && <Loader my="xl" />}
      {error && <Alert color="red" title="Error" icon={<IconAlertCircle />} my="xl">{error}</Alert>}

      {!loading && !error && (
        <ScrollArea mt="xl">
          <Table miw={700} verticalSpacing="sm">
            <Table.Thead>
              <Table.Tr>
                <Table.Th style={{ minWidth: '150px' }}>Company Name</Table.Th>
                <Table.Th style={{ minWidth: '150px' }}>Contact Name</Table.Th>
                <Table.Th style={{ minWidth: '150px' }}>Email</Table.Th>
                <Table.Th style={{ minWidth: '100px' }}>Status</Table.Th>
                <Table.Th style={{ minWidth: '150px' }}>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>{rows.length > 0 ? rows : <Table.Tr><Table.Td colSpan={5}><Text ta="center">No partner inquiries found.</Text></Table.Td></Table.Tr>}</Table.Tbody>
          </Table>
        </ScrollArea>
      )}

      <Modal opened={modalOpened} onClose={closeModal} title="Inquiry Details" size="lg">
        {selectedInquiry && (
          <Stack gap="md" p="md">
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xs">
              <Text fw={700}>Company:</Text><Text>{selectedInquiry.companyName}</Text>
              <Text fw={700}>Contact:</Text><Text>{selectedInquiry.contactName}</Text>
              <Text fw={700}>Email:</Text><Text>{selectedInquiry.email}</Text>
              <Text fw={700}>Phone:</Text><Text>{selectedInquiry.phone}</Text>
              <Text fw={700}>Status:</Text><Text component="div"><Badge color={statusColors[selectedInquiry.status]} variant="light">{selectedInquiry.status}</Badge></Text>
            </SimpleGrid>

            <AnimatedDivider size="md" />

            <Text fw={700}>Message:</Text>
            <Text style={{ whiteSpace: 'pre-wrap' }}>{selectedInquiry.message}</Text>
          </Stack>
        )}
      </Modal>
    </Container>
  );
}
