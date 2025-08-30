"use client";
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
  Skeleton,
} from "@mantine/core";
import Link from "next/link";
import classes from "./Shop.module.css";
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

interface Product {
    id: string;
    name: string;
    price: number;
    category: string;
    image?: string; // Assuming an image URL can be part of the product data
}

export function Shop() {
  const { data: products, error } = useSWR<Product[]>('/api/products', fetcher);
  const isLoading = !products && !error;
  const featuredProduct = products?.[0]; // Use the first product as the featured one

  return (
    <div className={classes.shop}>
      <Container size="lg" py="xl">
        <Title order={2} className={classes.title} ta="center" mt="sm">
          Chef's Tools & Equipment
        </Title>
        <Text c="dimmed" className={classes.description} ta="center" mt="md">
          Equip yourself with the best tools in the trade. High-quality knives,
          uniforms, and complete kits for the modern chef.
        </Text>

        <Grid gutter="xl" mt="xl" justify="center">
          <Grid.Col span={{ base: 12, md: 6, lg: 5 }}>
            {isLoading ? (
                <Skeleton height={400} />
            ) : featuredProduct ? (
                <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Card.Section>
                    <Image
                    src={featuredProduct.image || "https://images.unsplash.com/photo-1556909172-6ab63f18fd12?q=80&w=2070&auto=format&fit=crop"}
                    height={200}
                    alt={featuredProduct.name}
                    fallbackSrc="https://placehold.co/600x400?text=Product+Image"
                    />
                </Card.Section>

                <Group justify="space-between" mt="md" mb="xs">
                    <Text fw={500}>{featuredProduct.name}</Text>
                    <Badge color="orange" variant="light">
                    {featuredProduct.category}
                    </Badge>
                </Group>

                <Text size="sm" c="dimmed">
                    Our top-selling high-carbon stainless steel blade, perfect for
                    precision slicing and dicing.
                </Text>

                <Text size="xl" fw={700} mt="md">
                    ₦{(featuredProduct.price / 100).toFixed(2)}
                </Text>
                </Card>
            ) : (
                <Text ta="center">No featured product available.</Text>
            )}
          </Grid.Col>
        </Grid>

        <Group justify="center" mt="xl">
          <Button
            component={Link}
            href="/shop"
            variant="filled"
            color="orange"
            size="lg"
          >
            Visit The Full Shop
          </Button>
        </Group>
      </Container>
    </div>
  );
}

