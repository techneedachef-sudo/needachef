// C:/Users/hp/needachef/app/partner/settings/page.tsx
"use client";

import {
  Title,
  Paper,
  TextInput,
  Button,
  Group,
  Alert,
  LoadingOverlay,
  Divider,
  Select,
  PasswordInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useEffect, useState } from 'react';
import { handleApiError } from '@/utils/errorHandler';
import { showSuccessNotification } from '@/utils/successHandler';
import useSWR from 'swr';

// --- INTERFACES ---
interface PartnerSettings {
  name: string;
  email: string;
  paymentMethod: 'paypal' | 'bank_transfer' | '';
  paymentDetail: string;
}

class FetchError extends Error {
  info: any;
  status: number;

  constructor(message: string, info: any, status: number) {
    super(message);
    this.info = info;
    this.status = status;
  }
}

// --- FETCHER ---
const fetcher = async (url: string): Promise<PartnerSettings> => {
  const res = await fetch(url);
  if (!res.ok) {
    const info = await res.json();
    throw new FetchError('Failed to fetch settings.', info, res.status);
  }
  return res.json();
};

// --- COMPONENT ---
export default function SettingsPage() {
  const { data, error, isLoading, mutate } = useSWR('/api/partner/settings', fetcher);
  const [isUpdating, setIsUpdating] = useState(false);

  const form = useForm<PartnerSettings>({
    initialValues: {
      name: '',
      email: '',
      paymentMethod: '',
      paymentDetail: '',
    },
    validate: {
      email: (val) => (/^\S+@\S+$/.test(val) ? null : 'Invalid email'),
      name: (val) => (val.trim().length > 0 ? null : 'Name is required'),
    },
  });

  useEffect(() => {
    if (data) {
      form.setValues(data);
    }
  }, [data]);

  const passwordForm = useForm({
    initialValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    validate: {
      newPassword: (val) => (val.length >= 6 ? null : 'Password must be at least 6 characters'),
      confirmPassword: (val, values) => (val === values.newPassword ? null : 'Passwords do not match'),
    },
  });

  const handleProfileSubmit = async (values: PartnerSettings) => {
    setIsUpdating(true);
    try {
      const response = await fetch('/api/partner/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      if (!response.ok) throw new Error('Failed to update settings.');
      await mutate(); // Re-fetch and update SWR cache
      showSuccessNotification('Profile updated successfully!');
    } catch (err) {
      handleApiError(err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePasswordSubmit = async (values: typeof passwordForm.values) => {
    setIsUpdating(true);
    try {
      // IMPORTANT: Password changes should go to a separate, dedicated endpoint.
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.error || 'Failed to update password.');
      }
      showSuccessNotification('Password updated successfully!');
      passwordForm.reset();
    } catch (err) {
      handleApiError(err);
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return <LoadingOverlay visible />;
  }

  if (error) {
    return (
      <Alert color="red" title="Error">
        Could not load your settings. Please try again later.
      </Alert>
    );
  }

  return (
    <>
      <Title order={2} mb="lg">
        Account Settings
      </Title>
      <Paper withBorder shadow="sm" p="md" radius="md" pos="relative">
        <LoadingOverlay visible={isUpdating} />
        <form onSubmit={form.onSubmit(handleProfileSubmit)}>
          <Title order={4}>Profile Information</Title>
          <TextInput label="Full Name" mt="md" {...form.getInputProps('name')} />
          <TextInput label="Email Address" mt="md" {...form.getInputProps('email')} />

          <Divider my="xl" />

          <Title order={4}>Payment Details</Title>
          <Select
            label="Payment Method"
            placeholder="Select one"
            mt="md"
            data={['paypal', 'bank_transfer']}
            {...form.getInputProps('paymentMethod')}
          />
          <TextInput
            label="Payment Detail (Email or Account #)"
            mt="md"
            {...form.getInputProps('paymentDetail')}
          />

          <Group justify="flex-end" mt="xl">
            <Button type="submit" loading={isUpdating}>Save Changes</Button>
          </Group>
        </form>

        <Divider my="xl" />

        <form onSubmit={passwordForm.onSubmit(handlePasswordSubmit)}>
          <Title order={4}>Change Password</Title>
          <PasswordInput
            label="Current Password"
            mt="md"
            {...passwordForm.getInputProps('currentPassword')}
          />
          <PasswordInput label="New Password" mt="md" {...passwordForm.getInputProps('newPassword')} />
          <PasswordInput
            label="Confirm New Password"
            mt="md"
            {...passwordForm.getInputProps('confirmPassword')}
          />
          <Group justify="flex-end" mt="xl">
            <Button type="submit" color="orange" loading={isUpdating}>
              Update Password
            </Button>
          </Group>
        </form>
      </Paper>
    </>
  );
}