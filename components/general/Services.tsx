"use client";
import { Container, Title, Text, Card, Skeleton, SimpleGrid } from "@mantine/core";
import * as TablerIcons from "@tabler/icons-react"; // Import all icons
import classes from "./Services.module.css";
import useSWR from "swr";
import React from "react";

const fetcher = (url: string) => fetch(url).then(res => res.json());

const getIconComponent = (iconName: string | null) => {
    if (!iconName) return TablerIcons.IconToolsKitchen2; // Default fallback
    const IconComponent = (TablerIcons as any)[iconName];
    return IconComponent || TablerIcons.IconToolsKitchen2; // Fallback if iconName not found
};

interface Service {
    id: string;
    name: string;
    description: string | null;
    icon: string | null;
    type: 'TIERED' | 'PER_HEAD';
    options: any | null; // JSON field
    price: string | null; // For per-head services
    minGuests: string | null; // For per-head services
}

export function Services() {
  const { data: contentData, error: contentError } = useSWR('/api/content', fetcher);
  const { data: servicesData, error: servicesError } = useSWR<Service[]>('/api/services', fetcher);

  const isContentLoading = !contentData && !contentError;
  const isServicesLoading = !servicesData && !servicesError;
  
  const content = contentData?.homepage?.services;

  const items = servicesData?.map((service) => {
    const Icon = getIconComponent(service.icon);
    return (
        <Card
            key={service.id}
            shadow="md"
            radius="md"
            className={classes.card}
            padding="xl"
        >
            <Icon
                style={{ width: 50, height: 50 }}
                stroke={1.5}
                color="var(--mantine-color-orange-6)"
            />
            <Text fz="lg" fw={500} className={classes.cardTitle} mt="md">
                {service.name}
            </Text>
            <Text fz="sm" c="dimmed" mt="sm">
                {service.description}
            </Text>
        </Card>
    );
  });

  return (
    <Container size="lg" className="py-[2rem] md:py-[3.5rem]">
      {isContentLoading ? (
        <Skeleton height={40} width="40%" radius="md" mx="auto" />
      ) : (
        <Title order={2} className={classes.title} ta="center" mt="sm">
          {content?.title || "Our Services"}
        </Title>
      )}

      {isContentLoading ? (
        <>
          <Skeleton height={12} radius="md" mt={20} width="70%" mx="auto" />
          <Skeleton height={12} radius="md" mt={10} width="60%" mx="auto" />
        </>
      ) : (
        <Text c="dimmed" className={classes.description} ta="center" mt="md">
          {content?.description || "We offer a comprehensive range of culinary and hospitality solutions tailored to your needs."}
        </Text>
      )}

      <SimpleGrid cols={{ base: 1, md: 3 }} spacing="xl" mt={50}>
        {isServicesLoading ? Array(6).fill(0).map((_, i) => <Skeleton key={i} height={200} />) : items}
      </SimpleGrid>
    </Container>
  );
}
