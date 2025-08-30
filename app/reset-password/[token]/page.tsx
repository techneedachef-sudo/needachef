"use client";

import {
  Container,
  Title,
  Text,
  Paper,
  Button,
  Alert,
  PasswordInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useState } from "react";
import { IconAlertCircle, IconCheck } from "@tabler/icons-react";
import { useRouter, useParams } from "next/navigation";

export default function ResetPasswordPage() {
  const params = useParams();
  const token = params.token as string;
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const form = useForm({
    initialValues: {
      newPassword: '',
      confirmPassword: '',
    },
    validate: {
      newPassword: (value) => (value.length < 6 ? 'Password must be at least 6 characters' : null),
      confirmPassword: (value, values) => (value !== values.newPassword ? 'Passwords do not match' : null),
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: token,
          newPassword: values.newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset password.');
      }

      setSuccess(true);
      setTimeout(() => router.push('/login'), 3000); // Redirect after 3s
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
        <Container size={420} my={40}>
            <Alert color="green" title="Success!" icon={<IconCheck />} ta="center">
                <Text>Your password has been reset successfully.</Text>
                <Text>You will be redirected to the login page shortly.</Text>
            </Alert>
        </Container>
    )
  }

  return (
    <Container size={420} my={40}>
      <Title ta="center">Choose a new password</Title>
      <Text c="dimmed" size="sm" ta="center" mt={5}>
        Enter a new password for your account.
      </Text>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <PasswordInput
            label="New Password"
            placeholder="Your new password"
            required
            {...form.getInputProps('newPassword')}
          />
          <PasswordInput
            label="Confirm New Password"
            placeholder="Confirm your new password"
            required
            mt="md"
            {...form.getInputProps('confirmPassword')}
          />
          
          {error && (
            <Alert color="red" title="Error" icon={<IconAlertCircle />} mt="lg">
              {error}
            </Alert>
          )}

          <Button type="submit" loading={loading} fullWidth mt="xl">
            Reset Password
          </Button>
        </form>
      </Paper>
    </Container>
  );
}
