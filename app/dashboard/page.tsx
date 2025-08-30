"use client";

import { Container, Title, Text, SimpleGrid, Paper, Button } from "@mantine/core";
import { useAuth } from "@/components/auth/AuthProvider";
import Link from "next/link";

export default function DashboardOverviewPage() {
  const { user } = useAuth();

  return (
    <Container fluid>
      <Title order={2}>Welcome back, {user?.name}!</Title>
      <Text c="dimmed">Here&apos;s a quick overview of your account.</Text>

      <SimpleGrid cols={{ base: 1, sm: 2 }} mt="xl">
        <Paper withBorder p="md" radius="md">
          <Title order={4}>My Learning</Title>
          <Text c="dimmed" size="sm">Continue your learning journey.</Text>
          <Button component={Link} href="/dashboard/learning" mt="sm" className="!self-end">
            Go to My Learning
          </Button>
        </Paper>
        <Paper withBorder p="md" radius="md">
          <Title order={4}>My Orders</Title>
          <Text c="dimmed" size="sm">Track your recent product purchases.</Text>
          <Button component={Link} href="/dashboard/orders" mt="sm" className="!self-end">
            View Order History
          </Button>
        </Paper>
      </SimpleGrid>
    </Container>
  );
}
