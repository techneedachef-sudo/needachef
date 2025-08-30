"use client";

import { Modal, Button, Text, Group, Badge, Stack, Divider, NativeScrollArea } from "@mantine/core";
import { FallbackImage } from "./FallbackImage";
import Link from "next/link";
import {
  IconUsers,
  IconCurrencyNaira,
  IconBowl,
  IconUsersGroup,
  IconCalendarEvent,
  IconInfoCircle,
} from "@tabler/icons-react";

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

interface ServiceDetailModalProps {
  opened: boolean;
  onClose: () => void;
  item:
    | { type: "TIERED"; tier: Service; option: ServiceOption }
    | { type: "PER_HEAD"; option: Service }
    | null;
}

export function ServiceDetailModal({ opened, onClose, item }: ServiceDetailModalProps) {
  if (!item) {
    return null;
  }

  const isTiered = item.type === "TIERED";
  const title = isTiered ? `${item.tier.name} - ${item.option.price}` : `${item.option.name} - ${item.option.price}`;
  const description = isTiered ? item.tier.description : item.option.description;
  const imageUrl = ""; // Placeholder image for now, can be dynamic later

  const bookingLink = isTiered && item.tier.options
    ? `/booking?serviceId=${item.tier.id}&optionIndex=${item.tier.options.indexOf(item.option)}&type=tiered`
    : `/booking?serviceId=${(item.option as Service).id}&type=per-head`;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={<Text fw={700} size="xl">{title}</Text>}
      size="xl"
      radius={"10px"}
      zIndex={2000}
      overlayProps={{
        backgroundOpacity: 0.55,
        blur: 3,
      }}
      scrollAreaComponent={NativeScrollArea}
    >
      <Stack gap="md">
        <FallbackImage src={imageUrl} alt={title} height={160} width={200} style={{ objectFit: "contain" }} />
        <Text c="dimmed" fz="sm">
          {description}
        </Text>

        <Divider my="sm" />

        {isTiered ? (
          <>
            <Group wrap="nowrap" align="center">
              <IconUsers size={20} />
              <Text fz="sm">Coverage: <Text span fw={500}>{item.option.coverage}</Text></Text>
            </Group>
            <Group wrap="nowrap" align="center">
              <IconBowl size={20} />
              <Text fz="sm">Meals: <Text span fw={500}>{item.option.meals}</Text></Text>
            </Group>
            <Group wrap="nowrap" align="center">
              <IconUsersGroup size={20} />
              <Text fz="sm">Team: <Text span fw={500}>{item.option.team}</Text></Text>
            </Group>
            <Group wrap="nowrap" align="center">
              <IconCalendarEvent size={20} />
              <Text fz="sm">Ideal For: <Text span fw={500}>{item.option.idealFor}</Text></Text>
            </Group>
          </>
        ) : (
          <>
            <Group wrap="nowrap" align="center">
              <IconUsers size={20} />
              <Text fz="sm">Minimum Guests: <Text span fw={500}>{item.option.minGuests}</Text></Text>
            </Group>
            <Group wrap="nowrap" align="center">
              <IconInfoCircle size={20} />
              <Text fz="sm">Description: <Text span fw={500}>{item.option.description}</Text></Text>
            </Group>
          </>
        )}

        <Divider my="sm" />

        <Group justify="space-between" align="center">
          <Text fz="lg" fw={700}>
            Price: <Text span c="orange" inherit>{isTiered ? item.option.price : item.option.price}</Text>
          </Text>
          <Button
            component={Link}
            href={bookingLink}
            variant="gradient"
            gradient={{ from: "orange", to: "red" }}
            size="lg"
            radius="md"
          >
            Book Now
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
