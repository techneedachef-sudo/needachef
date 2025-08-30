"use client";
import { useState, useEffect } from "react";
import {
  Card,
  Title,
  Text,
  SimpleGrid,
  ThemeIcon,
  Modal,
  Button,
  Flex,
} from "@mantine/core";
import { motion } from "framer-motion";
import {
  IconChefHat,
  IconToolsKitchen2,
  IconCertificate,
  IconBuildingSkyscraper,
  IconUsers,
  IconClipboardList,
} from "@tabler/icons-react";
import classes from "./ServicesGrid.module.css";
import Link from "next/link";

const iconMap: Record<string, React.FC<any>> = {
    "In-Home Private Chef": IconChefHat,
    "Corporate Chef Services": IconBuildingSkyscraper,
    "Event Chef Staffing": IconUsers,
    "Monthly Managed Contracts": IconClipboardList,
    "Chef Recruitment & Screening": IconToolsKitchen2,
    "Menu Planning & Costing": IconCertificate,
    // Add other mappings as needed
};

export function ServicesGrid() {
  const [opened, setOpened] = useState(false);
  const [selectedService, setSelectedService] = useState<any | null>(null);
  const [services, setServices] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/services')
        .then(res => res.json())
        .then(data => {
            if (data && !data.error) {
                setServices(data);
            }
        })
        .catch(err => console.error("Failed to fetch services:", err));
    }, []);

  const openModal = (service: any) => {
    setSelectedService(service);
    setOpened(true);
  };

  const items = services.map((service) => {
    const Icon = iconMap[service.title] || IconChefHat;
    return (
        <motion.div whileHover={{ scale: 1.02, y: -5 }} key={service.title}>
        <Card
            shadow="sm"
            radius="md"
            withBorder
            className={classes.card}
            style={{ cursor: "pointer" }}
            onClick={() => openModal(service)}
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
            {service.title}
            </Title>
            <Text fz="sm" c="dimmed" mt="sm">
            {service.description}
            </Text>
        </Card>
        </motion.div>
    )
  });

  return (
    <>
      <Flex
        justify="space-around"
        gap="xl"
        wrap="wrap"
        direction="row"
      >
        {items}
      </Flex>

      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title={selectedService?.title}
      >
        {selectedService && (
          <>
            <Text c="dimmed">{selectedService.description}</Text>
            <Text mt="md">
              To book this service and discuss your specific needs, please proceed to our booking page.
            </Text>
            <Button
              component={Link}
              href="/booking"
              fullWidth
              mt="xl"
              variant="gradient"
              gradient={{ from: "orange", to: "red" }}
            >
              Book Now
            </Button>
          </>
        )}
      </Modal>
    </>
  );
}
