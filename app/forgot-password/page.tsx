"use client";

import {
  Container,
  Title,
  Text,
  Paper,
  TextInput,
  Button,
  Group,
  Alert,
  Anchor,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useState } from "react";
import { IconAlertCircle, IconArrowLeft } from "@tabler/icons-react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const form = useForm({
    initialValues: {
      email: '',
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email"),
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: values.email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'An unexpected error occurred.');
      }
      
      setMessage(data.message);
      form.reset();
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

  return (
    <>
    <Header />
    <Container size={420} my={40}>
      <Title ta="center">Forgot your password?</Title>
      <Text c="dimmed" size="sm" ta="center" mt={5}>
        Enter your email to get a reset link.
      </Text>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <TextInput
            label="Your email"
            placeholder="me@example.com"
            required
            {...form.getInputProps("email")}
          />
          
          {error && (
            <Alert color="red" title="Error" icon={<IconAlertCircle />} mt="lg">
              {error}
            </Alert>
          )}

          {message && (
            <Alert color="green" title="Request Sent" mt="lg">
              {message}
            </Alert>
          )}

          <Button type="submit" loading={loading} fullWidth mt="xl">
            Send Reset Link
          </Button>
        </form>
      </Paper>

      <Text c="dimmed" size="sm" ta="center" mt="lg">
        <Anchor component={Link} href="/login" size="sm">
            <Group gap="xs" justify="center" wrap="nowrap">
                <IconArrowLeft size={14} />
                Back to login
            </Group>
        </Anchor>
      </Text>
    </Container>
    <Footer />
    </>
  );
}
