"use client";

import { useSearchParams } from "next/navigation";
import {
  Paper,
  TextInput,
  PasswordInput,
  Button,
  Title,
  Text,
  Anchor,
  Container,
  Group,
  LoadingOverlay,
  Alert,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import { handleApiError } from "@/utils/errorHandler";
import classes from "./LoginPage.module.css";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";

export default function LoginClientPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { mutate } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm({
    initialValues: {
      email: "",
      password: "",
    },
    validate: {
      email: (val) => (/^\S+@\S+$/.test(val) ? null : "Invalid email"),
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    setError(null);
    try {
      const redirect = searchParams.get('redirect');
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, redirect }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      // Re-fetch user auth context
      await mutate();

      // Redirect based on the URL from the API
      router.push(data.redirectUrl || "/");
    } catch (err) {
      handleApiError(err);
      setError("Failed to login. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <Container size={420} my={40}>
        <Title ta="center" className={classes.title}>
          Welcome back!
        </Title>
        <Text c="dimmed" size="sm" ta="center" mt={5}>
          Do not have an account yet?{" "}
          <Anchor size="sm" component={Link} href="/signup">
            Create account
          </Anchor>
        </Text>
        <Paper withBorder shadow="md" p={30} mt={30} radius="md" pos="relative">
          <LoadingOverlay visible={loading} />
          <form onSubmit={form.onSubmit(handleSubmit)}>
            {error && (
              <Alert
                title="Login Error"
                color="red"
                withCloseButton
                onClose={() => setError(null)}
                mb="md"
              >
                {error}
              </Alert>
            )}
            <TextInput
              label="Email"
              placeholder="you@mantine.dev"
              required
              {...form.getInputProps("email")}
            />
            <PasswordInput
              label="Password"
              placeholder="Your password"
              required
              mt="md"
              {...form.getInputProps("password")}
            />
            <Group justify="space-between" mt="lg">
              <Anchor component={Link} href="/forgot-password" size="sm">
                Forgot password?
              </Anchor>
            </Group>
            <Button fullWidth mt="xl" type="submit">
              Sign in
            </Button>
          </form>
        </Paper>
      </Container>
      <Footer />
    </>
  );
}
