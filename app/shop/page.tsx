"use client";

import { useState, useEffect } from "react";
import {
  Container,
  Title,
  Text,
  Grid,
  Card,
  Button,
  Image,
  Group,
  Badge,
  Breadcrumbs,
  Anchor,
  TextInput,
  Select,
  Loader,
  Center,
  Skeleton,
} from "@mantine/core";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useCart } from "@/components/cart/CartContext";
import { notifications } from "@mantine/notifications";
import { IconCheck, IconSearch } from "@tabler/icons-react";
import { useDebouncedValue } from "@mantine/hooks";
import useSWR from 'swr';

interface Product {
  id: string;
  name: string;
  price: number;
  image?: string;
  category: string;
}

interface CartItem extends Product {
  quantity: number;
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

function ShopPage() {
  const { dispatch } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [debouncedSearch] = useDebouncedValue(searchTerm, 300);

  const { data: contentData, error: contentError } = useSWR('/api/content', fetcher);
  const isContentLoading = !contentData && !contentError;
  const content = contentData?.shopPage;

  useEffect(() => {
    const fetchCategories = async () => {
        try {
            const res = await fetch('/api/product-categories');
            const data = await res.json();
            setCategories(data);
        } catch (error) {
            console.error("Failed to fetch categories", error);
        }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const params = new URLSearchParams();
      if (debouncedSearch) {
        params.append('query', debouncedSearch);
      }
      if (category) {
        params.append('category', category);
      }
  
      try {
        const res = await fetch(`/api/products?${params.toString()}`);
        const data = await res.json();
        setProducts(data);
      } catch (error) {
        console.error("Failed to fetch products", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [debouncedSearch, category]);

  const handleAddToCart = (product: Product) => {
    const cartItem: CartItem = { ...product, quantity: 1 };
    dispatch({ type: 'ADD_ITEM', payload: cartItem });
    notifications.show({
      title: `${product.name} added`,
      message: "Item has been added to your cart.",
      color: 'teal',
      icon: <IconCheck size={18} />,
    });
  };

  const breadcrumbItems = [
    { title: "Home", href: "/" },
    { title: "Shop", href: "/shop" },
  ].map((item, index) => (
    <Anchor component={Link} href={item.href} key={index}>
      {item.title}
    </Anchor>
  ));

  return (
    <>
      <Header />
      <main>
        <Container size="lg" py="xl">
          <Breadcrumbs my="lg">{breadcrumbItems}</Breadcrumbs>
          
          {isContentLoading ? <Skeleton height={40} width="40%" /> : (
            <Title order={1} style={{ marginBottom: "2rem" }}>
              {content?.title || "Our Shop"}
            </Title>
          )}

          {isContentLoading ? <Skeleton height={12} width="80%" /> : (
            <Text c="dimmed" mb="xl">
              {content?.intro || "Equip yourself with the best tools in the trade. High-quality knives, uniforms, and complete kits for the modern chef."}
            </Text>
          )}

          <Grid gutter="md" mb="xl">
            <Grid.Col span={{ base: 12, md: 8 }}>
              <TextInput
                placeholder="Search for products..."
                leftSection={<IconSearch size={16} />}
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.currentTarget.value)}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Select
                placeholder="Filter by category"
                data={categories}
                value={category}
                onChange={(value) => setCategory(value || '')}
                clearable
              />
            </Grid.Col>
          </Grid>

          {loading ? (
            <Center h={200}><Loader /></Center>
          ) : products.length > 0 ? (
            <Grid gutter="xl">
              {products.map((product) => (
                <Grid.Col key={product.id} span={{ base: 12, md: 6, lg: 4 }}>
                  <Card shadow="sm" padding="lg" radius="md" withBorder component={Link} href={`/shop/${product.id}`}>
                    <Card.Section>
                      <Image
                        src={product.image || "https://placehold.co/600x400?text=Product+Image"}
                        height={180}
                        alt={product.name}
                        fallbackSrc="https://placehold.co/600x400?text=Product+Image"
                      />
                    </Card.Section>
                    <Group justify="space-between" mt="md" mb="xs">
                      <Text fw={500}>{product.name}</Text>
                      <Badge color="orange" variant="light">{product.category}</Badge>
                    </Group>
                    <Group justify="space-between" mt="md">
                      <Text size="xl" fw={700}>${(product.price / 100).toFixed(2)}</Text>
                      <Button
                        variant="filled"
                        color="orange"
                        onClick={(e) => {
                            e.preventDefault();
                            handleAddToCart(product);
                        }}
                      >
                        Add to Cart
                      </Button>
                    </Group>
                  </Card>
                </Grid.Col>
              ))}
            </Grid>
          ) : (
            <Center h={200}>
              <Text>No products found matching your criteria.</Text>
            </Center>
          )}
        </Container>
      </main>
      <Footer />
    </>
  );
}

export default ShopPage;
