"use client";

import { useEffect, useState, useMemo } from "react";
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
  ActionIcon,
  Modal,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconAlertCircle, IconPlus } from "@tabler/icons-react";
import { Service } from "./types";
import { PricingTierForm } from "@/components/admin/PricingTierForm";
import ServiceRow from "@/components/admin/ServiceRow";
import ServiceForm from "@/components/admin/ServiceForm";

export default function ServiceManagementPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);

  const fetchServices = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/admin/services");
      if (!res.ok) throw new Error("Failed to fetch services.");
      const data = await res.json();
      setServices(data);
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
    fetchServices();
  }, []);

  const handleEditClick = (service: Service) => {
    setSelectedService(service);
    openModal();
  };

  const handleNewClick = () => {
    setSelectedService(null);
    openModal();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this service?')) {
      try {
        const res = await fetch(`/api/admin/services`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id }),
        });
        if (!res.ok) throw new Error('Failed to delete service.');
        fetchServices(); // Refresh
      } catch {
        setError('Failed to delete service. Please try again.');
      }
    }
  };

  const handleFormSubmit = async (values: Omit<Service, 'id'>) => {
    const url = '/api/admin/services';
    const method = selectedService ? 'PUT' : 'POST';

    const body = JSON.stringify(selectedService ? { id: selectedService.id, ...values } : values);

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body,
      });
      if (!response.ok) throw new Error('Failed to save service.');
      fetchServices(); // Refresh
      closeModal();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred while saving.");
      }
    }
  };

  const rows = services.map((service) => (
    <ServiceRow
      key={service.id}
      service={service}
      onEdit={handleEditClick}
      onDelete={handleDelete}
    />
  ));

  return (
    <Container fluid>
      <Group justify="space-between">
        <div>
          <Title order={2}>Service Management</Title>
          <Text c="dimmed">Add, edit, and remove the services you offer.</Text>
        </div>
        <Button leftSection={<IconPlus size={16} />} onClick={handleNewClick}>
          New Service
        </Button>
      </Group>

      {loading && <Loader my="xl" />}
      {error && <Alert color="red" title="Error" icon={<IconAlertCircle />} my="xl">{error}</Alert>}

      {!loading && !error && (
        <ScrollArea mt="xl">
          <Table miw={700} verticalSpacing="sm">
            <Table.Thead>
              <Table.Tr>
                <Table.Th style={{ minWidth: '150px' }}>Name</Table.Th>
                <Table.Th style={{ minWidth: '100px' }}>Type</Table.Th>
                <Table.Th style={{ minWidth: '250px' }}>Description</Table.Th>
                <Table.Th style={{ minWidth: '100px' }}>Icon</Table.Th>
                <Table.Th style={{ minWidth: '150px' }}>Price (Per-Head)</Table.Th>
                <Table.Th style={{ minWidth: '150px' }}>Min Guests (Per-Head)</Table.Th>
                <Table.Th style={{ minWidth: '150px' }}>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>{rows.length > 0 ? rows : <Table.Tr><Table.Td colSpan={7}><Text ta="center">No services found.</Text></Table.Td></Table.Tr>}</Table.Tbody>
          </Table>
        </ScrollArea>
      )}

      <Modal opened={modalOpened} onClose={closeModal} title={selectedService ? 'Edit Service' : 'Create New Service'} size="lg">
        <ServiceForm
          initialService={selectedService}
          onSubmit={handleFormSubmit}
          onClose={closeModal}
        />
      </Modal>
    </Container>
  );
}
