"use client";

import { Container, Title, Text, Paper, Stepper, Alert, Loader } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useEffect, useState } from "react";
import { ChefApplicationStatus } from "@/app/generated/prisma";

interface ChefApplication {
    id: string;
    userId: string;
    fullName: string;
    email: string;
    phone: string;
    chefLevel: string;
    experience: string;
    bio: string;
    status: ChefApplicationStatus;
}

export default function ChefApplicationStatusPage() {
    const { user } = useAuth();
    const [application, setApplication] = useState<ChefApplication | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (user) {
            fetch('/api/chef/application')
                .then(res => {
                    if (!res.ok) {
                        throw new Error('Failed to fetch application status');
                    }
                    return res.json();
                })
                .then(data => {
                    setApplication(data);
                })
                .catch(err => {
                    setError(err.message);
                })
                .finally(() => {
                    setLoading(false);
                });
        }
    }, [user]);

    if (loading) {
        return <Loader />;
    }

    if (error) {
        return (
            <Container fluid>
                <Title order={2} mb="xl">My Chef Application</Title>
                <Alert color="red" title="Error" icon={<IconAlertCircle />}>
                    {error}
                </Alert>
            </Container>
        );
    }

    if (!application) {
        return (
            <Container fluid>
                <Title order={2} mb="xl">My Chef Application</Title>
                <Alert color="blue" title="No Application Found" icon={<IconAlertCircle />}>
                    We could not find a chef application associated with your account.
                </Alert>
            </Container>
        );
    }

    const getActiveStep = () => {
        switch (application.status) {
            case ChefApplicationStatus.PENDING: return 0;
            case ChefApplicationStatus.REVIEWED: return 1;
            case ChefApplicationStatus.APPROVED: return 2;
            case ChefApplicationStatus.DENIED: return 0; // Or a different state for denied
            default: return 0;
        }
    };

    return (
        <Container fluid>
            <Title order={2} mb="xl">My Chef Application</Title>
            <Paper withBorder p="xl" radius="md">
                <Title order={4}>Application Status: {application.status}</Title>
                <Text c="dimmed" mb="xl">Track the progress of your application to join our team of chefs.</Text>
                <Stepper active={getActiveStep()} >
                    <Stepper.Step label="Application Submitted" description="We've received your details." />
                    <Stepper.Step label="Under Review" description="Our team is reviewing your profile." />
                    <Stepper.Step label="Approved" description="Congratulations! You're in." />
                </Stepper>
                {application.status === ChefApplicationStatus.DENIED && (
                    <Alert color="red" title="Application Status" mt="xl">
                        We regret to inform you that your application was not successful at this time.
                    </Alert>
                )}
            </Paper>
        </Container>
    );
}
