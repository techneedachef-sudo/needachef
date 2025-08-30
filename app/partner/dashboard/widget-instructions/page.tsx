// C:/Users/hp/needachef/app/partner/dashboard/widget-instructions/page.tsx
"use client";

import { Title, Text, Paper, Code, Button, Group, Alert, Loader } from '@mantine/core';
import { IconCopy } from '@tabler/icons-react';
import { useClipboard } from '@mantine/hooks';
import { showSuccessNotification } from '@/utils/successHandler';
import useSWR from 'swr';
import { handleApiError } from '@/utils/errorHandler';

interface PartnerData {
  referralCode: string;
}

const fetcher = async (url: string): Promise<PartnerData> => {
  const res = await fetch(url);
  if (!res.ok) {
    const info = await res.json();
    throw new Error(info.error || 'Failed to fetch partner data.');
  }
  return res.json();
};

export default function WidgetInstructionsPage() {
  const clipboard = useClipboard({ timeout: 500 });
  const { data: partner, error, isLoading } = useSWR('/api/partner/settings', fetcher); // Reusing settings API to get referralCode

  if (isLoading) {
    return <Loader my="xl" />;
  }

  if (error) {
    handleApiError(error);
    return (
      <Alert color="red" title="Error" my="xl">
        Could not load your partner data. Please try again later.
      </Alert>
    );
  }

  const referralCode = partner?.referralCode || 'YOUR_REFERRAL_CODE';

  const widgetCode = `
<div id="needachef-widget" data-partner-ref="${referralCode}"></div>
<script src="${window.location.origin}/widget.js"></script>
  `;

  const handleCopy = () => {
    clipboard.copy(widgetCode);
    showSuccessNotification('Widget code copied to clipboard!');
  };

  return (
    <>
      <Title order={2} mb="lg">
        Widget Integration Instructions
      </Title>

      <Paper withBorder shadow="sm" p="md" radius="md" mb="xl">
        <Title order={4} mb="md">1. Embed the Widget</Title>
        <Text mb="sm">To display the NeedAChef booking widget on your website, simply copy and paste the following code snippet into your HTML where you want the widget to appear:</Text>
        <Code block>{widgetCode}</Code>
        <Group justify="flex-end" mt="md">
          <Button leftSection={<IconCopy size={16} />} onClick={handleCopy}>
            {clipboard.copied ? 'Copied!' : 'Copy Code'}
          </Button>
        </Group>
        <Text mt="md" c="dimmed">Your unique referral code (<code>{referralCode}</code>) is automatically embedded in the widget code. Any bookings or inquiries made through this widget will be attributed to you.</Text>
      </Paper>

      <Paper withBorder shadow="sm" p="md" radius="md">
        <Title order={4} mb="md">2. How Referral Tracking Works</Title>
        <Text mb="sm">When a user visits your site and interacts with the widget, your unique referral code (<code>data-partner-ref="${referralCode}"</code>) is automatically sent with any booking or inquiry made through it. This ensures you get credit for every referral.</Text>
        <Text>Ensure your website is accessible and the widget script (<code>widget.js</code>) is correctly loaded from your domain.</Text>
      </Paper>
    </>
  );
}
