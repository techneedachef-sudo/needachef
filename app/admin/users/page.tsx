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
  ActionIcon,
  Modal,
  TextInput,
  Select,
  Badge,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useForm } from "@mantine/form";
import { IconPencil, IconTrash, IconAlertCircle } from "@tabler/icons-react";
import { Role } from "@/app/generated/prisma";

interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

const roleColors: Record<Role, string> = {
    USER: 'gray',
    CHEF: 'blue',
    ADMIN: 'teal',
    PARTNER: 'orange',
};

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);

  const form = useForm<Omit<User, 'id'>>({
    initialValues: {
      name: '',
      email: '',
      role: Role.USER,
    },
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/users");
      if (!res.ok) throw new Error("Failed to fetch users.");
      const data = await res.json();
      setUsers(data);
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
    fetchUsers();
  }, []);

  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    form.setValues({
        name: user.name,
        email: user.email,
        role: user.role,
    });
    openModal();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this user? This action is permanent.')) {
      setUsers(u => u.filter(user => user.id !== id));
      try {
        await fetch(`/api/admin/users`, { 
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id }),
        });
      } catch {
        setError('Failed to delete user.');
        fetchUsers();
      }
    }
  };

  const handleSubmit = async (values: Omit<User, 'id'>) => {
    if (!selectedUser) return; // For now, we only support editing

    const url = '/api/admin/users';
    const method = 'PUT';
    const body = JSON.stringify({ id: selectedUser.id, ...values });

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body,
      });
      if (!response.ok) throw new Error('Failed to save user.');
      await fetchUsers();
      closeModal();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred while saving.");
      }
    }
  };

  const rows = users.map((row) => (
    <Table.Tr key={row.id}>
      <Table.Td style={{ minWidth: '150px' }}>{row.name}</Table.Td>
      <Table.Td style={{ minWidth: '150px' }}>{row.email}</Table.Td>
      <Table.Td style={{ minWidth: '100px' }}>
        <Badge color={roleColors[row.role]} variant="light">
            {row.role}
        </Badge>
      </Table.Td>
      <Table.Td style={{ minWidth: '150px' }}>
        <Group gap="xs">
          <ActionIcon variant="subtle" onClick={() => handleEditClick(row)}>
            <IconPencil size={16} />
          </ActionIcon>
          <ActionIcon variant="subtle" color="red" onClick={() => handleDelete(row.id)}>
            <IconTrash size={16} />
          </ActionIcon>
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Container fluid>
      <Title order={2}>User Management</Title>
      <Text c="dimmed">View, edit, and manage all registered users.</Text>

      {loading && <Loader my="xl" />}
      {error && <Alert color="red" title="Error" icon={<IconAlertCircle />} my="xl">{error}</Alert>}

      {!loading && !error && (
        <ScrollArea mt="xl">
          <Table miw={800} verticalSpacing="sm">
            <Table.Thead>
              <Table.Tr>
                <Table.Th style={{ minWidth: '150px' }}>Name</Table.Th>
                <Table.Th style={{ minWidth: '150px' }}>Email</Table.Th>
                <Table.Th style={{ minWidth: '100px' }}>Role</Table.Th>
                <Table.Th style={{ minWidth: '150px' }}>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>{rows.length > 0 ? rows : <Table.Tr><Table.Td colSpan={4}><Text ta="center">No users found.</Text></Table.Td></Table.Tr>}</Table.Tbody>
          </Table>
        </ScrollArea>
      )}

      <Modal opened={modalOpened} onClose={closeModal} title="Edit User">
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <TextInput label="Name" {...form.getInputProps('name')} required />
          <TextInput label="Email" {...form.getInputProps('email')} mt="md" required />
          <Select
            label="Role"
            placeholder="Pick a role"
            data={[Role.USER, Role.CHEF, Role.ADMIN, Role.PARTNER]}
            {...form.getInputProps('role')}
            mt="md"
            required
          />
          <Button type="submit" mt="lg">Save User</Button>
        </form>
      </Modal>
    </Container>
  );
}
