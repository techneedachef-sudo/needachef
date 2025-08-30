"use client";
import { Container, Title, Text, Card, ThemeIcon, SimpleGrid, Skeleton } from "@mantine/core";
import { IconCrown, IconStar, IconToolsKitchen, IconUser, IconSchool, IconWashMachine } from "@tabler/icons-react";
import classes from "./ChefLevels.module.css";
import useSWR from 'swr';
import React from "react";

const fetcher = (url: string) => fetch(url).then(res => res.json());

const iconMap: Record<string, React.FC<any>> = {
    "Executive Chef": IconCrown,
    "Sous Chef": IconStar,
    "Chef de Partie": IconToolsKitchen,
    "Personal / Private Chef": IconUser,
    "Junior Chef / Commis Chef": IconSchool,
    "Kitchen Assistant / Steward": IconWashMachine,
    "Default": IconToolsKitchen,
};

interface ChefLevel {
    title: string;
    description: string;
}

export function ChefLevels() {
  const { data: levels, error } = useSWR<ChefLevel[]>('/api/chef-levels', fetcher);
  const isLoading = !levels && !error;

  const items = levels?.map((level) => {
    const Icon = iconMap[level.title] || iconMap["Default"];
    return (
        <Card
            key={level.title}
            shadow="md"
            radius="md"
            className={classes.card}
            padding="lg"
        >
            <ThemeIcon
                size={50}
                radius="md"
                variant="gradient"
                gradient={{ from: "orange", to: "red" }}
            >
                <Icon stroke={1.5} />
            </ThemeIcon>
            <Text fz="lg" fw={500} mt="md">
                {level.title}
            </Text>
            <Text fz="sm" c="dimmed" mt="sm">
                {level.description}
            </Text>
        </Card>
    );
  });

  return (
    <Container size="lg" className="py-[2rem] md:py-[3.5rem]">
      <Title order={2} className={classes.title} ta="center">
        Our Chef Structure
      </Title>
      <Text c="dimmed" className={classes.description} ta="center" mt="md">
        We provide a range of culinary professionals to match your specific
        needs, from executive leadership to essential support.
      </Text>
      <SimpleGrid cols={{ base: 1, md: 3 }} spacing="xl" mt={50}>
        {isLoading ? Array(6).fill(0).map((_, i) => <Skeleton key={i} height={200} />) : items}
      </SimpleGrid>
    </Container>
  );
}
