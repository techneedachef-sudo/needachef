"use client";

import {
  Container,
  Title,
  Text,
  SimpleGrid,
  Paper,
  Group,
  ThemeIcon,
  Button,
  Loader,
  Alert,
} from "@mantine/core";
import {
  IconChefHat,
  IconBuildingStore,
  IconUsers,
  IconCash,
  IconLogout,
  IconAlertCircle,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface DashboardStats {
    totalRevenue: number;
    newChefApplications: number;
    pendingInquiries: number;
    totalUsers: number;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch dashboard data");
        }
        return res.json();
      })
      .then((data) => {
        setStats(data);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/login");
  };

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return <Alert color="red" title="Error" icon={<IconAlertCircle />}>{error}</Alert>;
  }

  const statsData = [
    { title: "Total Revenue", value: `${(stats?.totalRevenue || 0 / 100).toFixed(2)}`, icon: IconCash, color: "teal" },
    { title: "New Chef Applications", value: stats?.newChefApplications.toString() || '0', icon: IconChefHat, color: "orange" },
    { title: "Pending Partner Inquiries", value: stats?.pendingInquiries.toString() || '0', icon: IconBuildingStore, color: "blue" },
    { title: "Total Users", value: stats?.totalUsers.toString() || '0', icon: IconUsers, color: "grape" },
  ];

  const items = statsData.map((stat) => (
    <Paper withBorder p="md" radius="md" key={stat.title}>
      <Group>
        <ThemeIcon color={stat.color} variant="light" size={38} radius="md">
          <stat.icon size="1.8rem" stroke={1.5} />
        </ThemeIcon>
        <div>
          <Text c="dimmed" className="md:w-[150px] lg:w-[200px]" size="xs" tt="uppercase" fw={700}>
            {stat.title}
          </Text>
          <Text fw={700} size="xl">
            {stat.value}
          </Text>
        </div>
      </Group>
    </Paper>
  ));

  return (
    <Container fluid>
      <Group justify="space-between" mb="xl">
        <div>
          <Title order={2}>Dashboard Overview</Title>
          <Text c="dimmed">Welcome back, Admin!</Text>
        </div>
        <Button onClick={handleLogout} variant="outline" color="red" leftSection={<IconLogout size={16} />}>
          Logout
        </Button>
      </Group>

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>{items}</SimpleGrid>
    </Container>
  );
}
