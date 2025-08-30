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
  Textarea,
  NumberInput,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useForm } from "@mantine/form";
import { IconPlus, IconPencil, IconTrash, IconAlertCircle, IconBook } from "@tabler/icons-react";
import Link from "next/link";

interface Course {
  id: string;
  title: string;
  category: string;
  duration: string;
  price: number;
  description: string;
}

type CourseFormData = Omit<Course, 'id'>;

export default function CourseManagementPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);

  const form = useForm<CourseFormData>({
    initialValues: {
      title: '',
      category: '',
      duration: '',
      price: 0,
      description: '',
    },
    validate: {
      title: (value) => (value.length < 3 ? 'Title must have at least 3 letters' : null),
      category: (value) => (value.length < 3 ? 'Category must have at least 3 letters' : null),
      duration: (value) => (value.length < 2 ? 'Duration is required' : null),
      price: (value) => (value <= 0 ? 'Price must be positive' : null),
    }
  });

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/admin/courses");
      if (!res.ok) throw new Error("Failed to fetch courses.");
      const data = await res.json();
      setCourses(data);
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
    fetchCourses();
  }, []);

  const handleAddClick = () => {
    setSelectedCourse(null);
    form.reset();
    openModal();
  };

  const handleEditClick = (course: Course) => {
    setSelectedCourse(course);
    form.setValues(course);
    openModal();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this course?')) {
      setCourses(c => c.filter(course => course.id !== id));
      try {
        const res = await fetch(`/api/admin/courses`, { 
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id }),
        });
        if (!res.ok) throw new Error('Failed to delete course.');
      } catch {
        setError('Failed to delete course. Please refresh.');
      }
    }
  };

  const handleSubmit = async (values: CourseFormData) => {
    const url = '/api/admin/courses';
    const method = selectedCourse ? 'PUT' : 'POST';
    const body = JSON.stringify(selectedCourse ? { id: selectedCourse.id, ...values } : values);

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body,
      });
      if (!response.ok) throw new Error('Failed to save course.');
      await fetchCourses();
      closeModal();
    } catch (err) {
        if (err instanceof Error) {
            setError(err.message);
        } else {
            setError("An unknown error occurred while saving.");
        }
    }
  };

  const rows = courses.map((row) => (
    <Table.Tr key={row.id}>
      <Table.Td style={{ minWidth: '150px' }}>{row.title}</Table.Td>
      <Table.Td style={{ minWidth: '120px' }}>{row.category}</Table.Td>
      <Table.Td style={{ minWidth: '100px' }}>{row.duration}</Table.Td>
      <Table.Td style={{ minWidth: '100px' }}>${(row.price / 100).toFixed(2)}</Table.Td>
      <Table.Td style={{ minWidth: '150px' }}>
        <Group gap="xs">
          <ActionIcon component={Link} href={`/admin/courses/${row.id}`} variant="subtle" color="gray">
            <IconBook size={16} />
          </ActionIcon>
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
      <Group justify="space-between" mb="lg">
        <div>
            <Title order={2}>Course Management</Title>
            <Text c="dimmed">Create, edit, and manage all learning courses.</Text>
        </div>
        <Button leftSection={<IconPlus size={14} />} onClick={handleAddClick}>
          Add Course
        </Button>
      </Group>

      {loading && <Loader my="xl" />}
      {error && <Alert color="red" title="Error" icon={<IconAlertCircle />} my="xl">{error}</Alert>}

      {!loading && !error && (
        <ScrollArea>
          <Table miw={700} verticalSpacing="sm">
            <Table.Thead>
              <Table.Tr>
                <Table.Th style={{ minWidth: '150px' }}>Title</Table.Th>
                <Table.Th style={{ minWidth: '120px' }}>Category</Table.Th>
                <Table.Th style={{ minWidth: '100px' }}>Duration</Table.Th>
                <Table.Th style={{ minWidth: '100px' }}>Price</Table.Th>
                <Table.Th style={{ minWidth: '150px' }}>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>{rows.length > 0 ? rows : <Table.Tr><Table.Td colSpan={5}><Text c="dimmed" ta="center">No courses found.</Text></Table.Td></Table.Tr>}</Table.Tbody>
          </Table>
        </ScrollArea>
      )}

      <Modal opened={modalOpened} onClose={closeModal} title={selectedCourse ? "Edit Course" : "Add Course"}>
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <TextInput label="Title" {...form.getInputProps('title')} required />
          <TextInput label="Category" {...form.getInputProps('category')} mt="md" required />
          <TextInput label="Duration" {...form.getInputProps('duration')} mt="md" required />
          <NumberInput label="Price (in cents)" {...form.getInputProps('price')} mt="md" required min={0} />
          <Textarea label="Description" {...form.getInputProps('description')} mt="md" />
          <Button type="submit" mt="lg" fullWidth>
            {selectedCourse ? "Save Changes" : "Create Course"}
          </Button>
        </form>
      </Modal>
    </Container>
  );
}

