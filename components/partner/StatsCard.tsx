"use client";

import { Card, Text, Group, RingProgress, useMantineTheme } from '@mantine/core';
import classes from './StatsCard.module.css';

interface StatsCardProps {
  title: string;
  value: string;
  diff: number;
  period: string;
}

export function StatsCard({ title, value, diff, period }: StatsCardProps) {
  const theme = useMantineTheme();
  const positive = diff >= 0;

  return (
    <Card withBorder p="lg" radius="md" className={classes.card}>
      <Group justify="space-between">
        <Text size="xs" c="dimmed" className={classes.title}>
          {title}
        </Text>
        {/* You can add an icon here if you want */}
      </Group>

      <Group align="flex-end" gap="xs" mt={25}>
        <Text className={classes.value}>{value}</Text>
        <Text c={positive ? 'teal' : 'red'} fz="sm" fw={500} className={classes.diff}>
          <span>{positive ? '↑' : '↓'} {Math.abs(diff)}%</span>
        </Text>
      </Group>

      <Text fz="xs" c="dimmed" mt={7}>
        Compared to {period}
      </Text>
    </Card>
  );
}
