"use client";

import { useEffect, useState } from "react";
import {
  Table,
  ScrollArea,
  Button,
  Group,
  Loader,
  Alert,
  ActionIcon,
  Modal,
  TextInput,
  NumberInput,
  Text,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useForm } from "@mantine/form";
import { IconPlus, IconPencil, IconTrash, IconAlertCircle } from "@tabler/icons-react";

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
}

type ProductFormData = Omit<Product, 'id'>;

export function ProductsTab() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);

  const form = useForm<ProductFormData>({
    initialValues: {
      name: '',
      category: '',
      price: 0,
      stock: 0,
    },
    validate: {
        name: (value) => (value.length < 2 ? 'Name must have at least 2 letters' : null),
        category: (value) => (value.length < 2 ? 'Category must have at least 2 letters' : null),
        price: (value) => (value <= 0 ? 'Price must be positive' : null),
        stock: (value) => (value < 0 ? 'Stock cannot be negative' : null),
    }
  });

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/admin/products");
      if (!res.ok) throw new Error("Failed to fetch products.");
      const data = await res.json();
      setProducts(data);
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
    fetchProducts();
  }, []);

  const handleAddClick = () => {
    setSelectedProduct(null);
    form.reset();
    openModal();
  };

  const handleEditClick = (product: Product) => {
    setSelectedProduct(product);
    form.setValues({
        name: product.name,
        category: product.category,
        price: product.price,
        stock: product.stock,
    });
    openModal();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      setProducts(p => p.filter(product => product.id !== id));
      try {
        const res = await fetch(`/api/admin/products`, { 
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id }),
        });
        if (!res.ok) throw new Error('Failed to delete product.');
      } catch {
        setError('Failed to delete product. Please refresh.');
      }
    }
  };

  const handleSubmit = async (values: ProductFormData) => {
    const url = '/api/admin/products';
    const method = selectedProduct ? 'PUT' : 'POST';
    const body = JSON.stringify(selectedProduct ? { id: selectedProduct.id, ...values } : values);

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body,
      });
      if (!response.ok) throw new Error('Failed to save product.');
      await fetchProducts();
      closeModal();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred while saving.");
      }
    }
  };

  const rows = products.map((row) => (
    <Table.Tr key={row.id}>
      <Table.Td>{row.name}</Table.Td>
      <Table.Td>{row.category}</Table.Td>
      <Table.Td>${(row.price / 100).toFixed(2)}</Table.Td>
      <Table.Td>{row.stock}</Table.Td>
      <Table.Td>
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
    <div>
      <Group justify="space-between" mb="lg">
        <Text>Manage your store&apos;s products.</Text>
        <Button leftSection={<IconPlus size={14} />} onClick={handleAddClick}>
          Add Product
        </Button>
      </Group>

      {loading && <Loader my="xl" />}
      {error && <Alert color="red" title="Error" icon={<IconAlertCircle />} my="xl">{error}</Alert>}

      {!loading && !error && (
        <ScrollArea>
          <Table miw={700} verticalSpacing="sm">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Name</Table.Th>
                <Table.Th>Category</Table.Th>
                <Table.Th>Price</Table.Th>
                <Table.Th>Stock</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>{rows.length > 0 ? rows : <Table.Tr><Table.Td colSpan={5}><Text c="dimmed" ta="center">No products found.</Text></Table.Td></Table.Tr>}</Table.Tbody>
          </Table>
        </ScrollArea>
      )}

      <Modal opened={modalOpened} onClose={closeModal} title={selectedProduct ? "Edit Product" : "Add Product"}>
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <TextInput label="Name" {...form.getInputProps('name')} required />
          <TextInput label="Category" {...form.getInputProps('category')} mt="md" required />
          <NumberInput label="Price (in cents)" {...form.getInputProps('price')} mt="md" required min={0} />
          <NumberInput label="Stock" {...form.getInputProps('stock')} mt="md" required min={0} />
          <Button type="submit" mt="lg" fullWidth>
            {selectedProduct ? "Save Changes" : "Create Product"}
          </Button>
        </form>
      </Modal>
    </div>
  );
}

