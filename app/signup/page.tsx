"use client";

import {
  Paper,
  TextInput,
  PasswordInput,
  Button,
  Title,
  Text,
  Anchor,
  Container,
  Alert,
  Progress,
  Box,
  Group,
} from "@mantine/core";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconAlertCircle, IconCheck, IconX } from "@tabler/icons-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { notifications } from "@mantine/notifications";

function PasswordRequirement({ meets, label }: { meets: boolean; label: string }) {
    return (
      <Text
        color={meets ? 'teal' : 'red'}
        style={{ display: 'flex', alignItems: 'center' }}
        mt={7}
        size="sm"
      >
        {meets ? <IconCheck size={14} /> : <IconX size={14} />} <span className="ml-3">{label}</span>
      </Text>
    );
}

const requirements = [
    { re: /[0-9]/, label: 'Includes number' },
    { re: /[a-z]/, label: 'Includes lowercase letter' },
    { re: /[A-Z]/, label: 'Includes uppercase letter' },
    { re: /[$&+,:;=?@#|'<>.^*()%!-]/, label: 'Includes special symbol' },
];

function getStrength(password: string) {
    let multiplier = password.length > 7 ? 0 : 1;
  
    requirements.forEach((requirement) => {
      if (!requirement.re.test(password)) {
        multiplier += 1;
      }
    });
  
    return Math.max(100 - (100 / (requirements.length + 1)) * multiplier, 10);
}

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const strength = getStrength(password);
  const checks = requirements.map((requirement, index) => (
    <PasswordRequirement key={index} label={requirement.label} meets={requirement.re.test(password)} />
  ));
  const passwordError = password !== confirmPassword ? "Passwords do not match" : null;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
    }
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (response.ok) {
        notifications.show({
          title: "Account Created!",
          message: "You can now log in with your new account.",
          color: "green",
          icon: <IconCheck />,
        });
        router.push("/login");
      } else {
        const data = await response.json();
        setError(data.error || "Failed to create account.");
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <Container size={420} my={40}>
        <Title ta="center">Create Your Account</Title>
        <Text c="dimmed" size="sm" ta="center" mt={5}>
          Already have an account?{" "}
          <Anchor size="sm" component={Link} href="/login">
            Log in
          </Anchor>
        </Text>

        <Paper withBorder shadow="md" p={30} mt={30} radius="md">
          <form onSubmit={handleSubmit}>
            <TextInput
              label="Name"
              placeholder="Your name"
              required
              value={name}
              onChange={(event) => setName(event.currentTarget.value)}
            />
            <TextInput
              label="Email"
              placeholder="you@mantine.dev"
              required
              mt="md"
              value={email}
              onChange={(event) => setEmail(event.currentTarget.value)}
            />
            <PasswordInput
              label="Password"
              placeholder="Your password"
              required
              mt="md"
              value={password}
              onChange={(event) => setPassword(event.currentTarget.value)}
            />
            {password.length > 0 && (
                <div>
                    <Progress color={strength > 80 ? 'teal' : strength > 50 ? 'yellow' : 'red'} value={strength} size={5} mt="sm" />
                    {checks}
                </div>
            )}
            <PasswordInput
              label="Confirm Password"
              placeholder="Confirm your password"
              required
              mt="md"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.currentTarget.value)}
              error={passwordError}
            />
            {error && (
              <Alert
                icon={<IconAlertCircle size="1rem" />}
                title="Signup Failed"
                color="red"
                mt="md"
              >
                {error}
              </Alert>
            )}
            <Button fullWidth mt="xl" type="submit" loading={loading}>
              Create Account
            </Button>
          </form>
        </Paper>
      </Container>
      <Footer />
    </>
  );
}
