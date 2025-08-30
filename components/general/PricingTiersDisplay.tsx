"use client";

import { useState } from "react";
import {
  Card,
  Title,
  Text,
  ThemeIcon,
  Group,
  Badge,
  Loader,
  Alert,
  Container, // Import Container
} from "@mantine/core";
import { motion } from "framer-motion";
import * as TablerIcons from "@tabler/icons-react"; // Import all icons
import classes from "./ServicesGrid.module.css";
import { ServiceDetailModal } from "./ServiceDetailModal";
import useSWR from "swr";
import { IconAlertCircle } from "@tabler/icons-react";

interface ServiceOption {
  price: string;
  coverage: string;
  meals: string;
  team: string;
  idealFor: string;
}

interface Service {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  type: 'TIERED' | 'PER_HEAD';
  options: ServiceOption[] | null; // JSON field
  price: string | null; // For per-head services
  minGuests: string | null; // For per-head services
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const getIconComponent = (iconName: string | null) => {
  if (!iconName) return TablerIcons.IconChefHat; // Default fallback
  const IconComponent = (TablerIcons as any)[iconName];
  return IconComponent || TablerIcons.IconChefHat; // Fallback if iconName not found
};

export function PricingTiersDisplay() {
  const { data: services, error, isLoading } = useSWR<Service[]>("/api/services", fetcher);

  const [modalOpened, setModalOpened] = useState(false);
  const [selectedItem, setSelectedItem] = useState<
    | { type: "TIERED"; tier: Service; option: ServiceOption }
    | { type: "PER_HEAD"; option: Service }
    | null
  >(null);

  const openModal = (
    item:
      | { type: "TIERED"; tier: Service; option: ServiceOption }
      | { type: "PER_HEAD"; option: Service }
  ) => {
    setSelectedItem(item);
    setModalOpened(true);
  };

  if (isLoading) {
    return <Loader my="xl" />;
  }

  if (error || !services) {
    return (
      <Alert color="red" title="Error loading services" icon={<IconAlertCircle />} my="xl">
        Failed to load services. Please try again later.
      </Alert>
    );
  }

  const tieredServices = services.filter(
    (service) => service.type === "TIERED"
  );
  const perHeadOptions = services.filter(
    (service) => service.type === "PER_HEAD"
  );

  return (
    <Container size="xl"> {/* Wrap content in Mantine Container */}
      <Title order={2} ta="center" mt="xl" mb="lg">
        Our Chef Packages
      </Title>
      <div className={classes.masonryGrid} style={{ marginTop: 'var(--mantine-spacing-xl)' }}>
        {tieredServices.map((service) => {
          const Icon = getIconComponent(service.icon);
          return (
            <motion.div whileHover={{ scale: 1.02, y: -5 }} key={service.id}>
              <Card shadow="sm" radius="md" withBorder className={classes.card}>
                <ThemeIcon
                  size={50}
                  radius={50}
                  variant="gradient"
                  gradient={{ from: "orange", to: "red" }}
                >
                  <Icon style={{ width: "60%", height: "60%" }} />
                </ThemeIcon>
                <Title order={3} className={classes.cardTitle} mt="md">
                  {service.name}
                </Title>
                <Text fz="sm" c="dimmed" mt="sm" mb="md">
                  {service.description}
                </Text>
                {service.options && service.options.map((option, index) => (
                  <Card
                    key={index}
                    withBorder
                    shadow="xs"
                    radius="md"
                    p="sm"
                    mb="sm"
                    style={{ cursor: "pointer" }}
                    onClick={() => openModal({ type: "TIERED", tier: service, option })}
                  >
                    <Group justify="space-between" align="center">
                      <Text fw={700} size="lg">
                        {option.price}
                      </Text>
                      <Badge variant="light" color="orange">
                        {option.coverage}
                      </Badge>
                    </Group>
                    <Text fz="xs" c="dimmed" mt={4}>
                      {option.meals.split(" (")[0]}
                    </Text>
                  </Card>
                ))}
              </Card>
            </motion.div>
          );
        })}
      </div>

      <Title order={2} ta="center" mt="xl" mb="lg">
        Per Head Meal Options
      </Title>
      <div className={classes.masonryGridPerHead} style={{ marginTop: 'var(--mantine-spacing-xl)' }}>
        {perHeadOptions.map((service) => {
          const Icon = getIconComponent(service.icon);
          return (
            <motion.div whileHover={{ scale: 1.02, y: -5 }} key={service.id}>
              <Card
                shadow="sm"
                radius="md"
                withBorder
                className={classes.card}
                style={{ cursor: "pointer" }}
                onClick={() => openModal({ type: "PER_HEAD", option: service })}
              >
                <ThemeIcon
                  size={50}
                  radius={50}
                  variant="gradient"
                  gradient={{ from: "orange", to: "red" }}
                >
                  <Icon style={{ width: "60%", height: "60%" }} />
                </ThemeIcon>
                <Title order={3} className={classes.cardTitle} mt="md">
                  {service.name}
                </Title>
                <Text fz="sm" c="dimmed" mt="sm" mb="md">
                  {service.description}
                </Text>
                <Group justify="space-between" align="center">
                  <Text fw={700} size="lg">
                    {service.price}
                  </Text>
                  <Badge variant="light" color="grape">
                    {service.minGuests}
                  </Badge>
                </Group>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <ServiceDetailModal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        item={selectedItem}
      />
    </Container>
  );
}
