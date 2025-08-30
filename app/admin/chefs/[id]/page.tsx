"use client";

import { useEffect, useState } from "react";
import {
  Container,
  Title,
  Text,
  Loader,
  Alert,
  Paper,
  Button,
  Group,
  Image,
  SimpleGrid,
  Stack,
  Breadcrumbs,
  Anchor,
  Center,
} from "@mantine/core";
import { IconAlertCircle, IconCopy } from "@tabler/icons-react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { notifications } from "@mantine/notifications";

interface ChefProfile {
  specialties: string[];
  yearsOfExperience: number;
  portfolioImages: string[];
}

interface Chef {
  id: string;
  name: string;
  email: string;
  phone?: string;
  bio?: string;
  profilePicture?: string;
  chefProfile?: ChefProfile;
}

export default function AdminChefDetailPage() {
  const params = useParams();
  const chefId = params.id as string;
  const [chef, setChef] = useState<Chef | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChefDetails = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/admin/chefs/${chefId}`);
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Failed to fetch chef details.");
        }
        const data = await res.json();
        setChef(data);
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

    if (chefId) {
      fetchChefDetails();
    }
  }, [chefId]);

  const handleCopyProfileLink = () => {
    const profileLink = `${window.location.origin}/chefs/${chefId}`;
    navigator.clipboard.writeText(profileLink);
    notifications.show({
      title: "Link Copied!",
      message: "Chef profile link copied to clipboard.",
      color: "green",
      icon: <IconCopy size={16} />,
    });
  };

  const breadcrumbs = [
    { title: "Admin", href: "/admin" },
    { title: "Chef Management", href: "/admin/chefs" },
    { title: chef?.name || "Chef Details", href: `/admin/chefs/${chefId}` },
  ].map((item, index) => (
    <Anchor component={Link} href={item.href} key={index}>
      {item.title}
    </Anchor>
  ));

  if (loading) {
    return (
      <Container fluid>
        <Loader my="xl" />
      </Container>
    );
  }

  if (error || !chef) {
    return (
      <Container fluid>
        <Alert color="red" title="Error" icon={<IconAlertCircle />} my="xl">
          {error || "Chef not found."}
        </Alert>
      </Container>
    );
  }

  return (
    <Container size="lg">
      <Breadcrumbs my="lg">{breadcrumbs}</Breadcrumbs>
      <Group justify="space-between" align="center" mb="xl">
        <Title order={2}>{chef.name} - Chef Profile</Title>
        <Button leftSection={<IconCopy size={16} />} onClick={handleCopyProfileLink}>
          Share Profile Link
        </Button>
      </Group>

      {chef.profilePicture && (
        <Center mb="xl">
          <Image
            src={chef.profilePicture}
            alt={`${chef.name}'s profile picture`}
              width="15rem"
              height="15rem"
              className="!w-[15rem]"
            radius="50%"
            fit="cover"
          />
        </Center>
      )}

      <Paper withBorder p="xl" radius="md" mb="xl">
        <Title order={4} mb="md">Personal Details</Title>
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xs">
          <Text fw={700}>Email:</Text><Text>{chef.email}</Text>
          <Text fw={700}>Phone:</Text><Text>{chef.phone || 'N/A'}</Text>
          <Text fw={700}>Bio:</Text><Text>{chef.bio || 'N/A'}</Text>
        </SimpleGrid>
      </Paper>

      {chef.chefProfile && (
        <Paper withBorder p="xl" radius="md" mb="xl">
          <Title order={4} mb="md">Professional Details</Title>
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xs">
            <Text fw={700}>Specialties:</Text><Text>{chef.chefProfile.specialties.join(', ') || 'N/A'}</Text>
            <Text fw={700}>Years of Experience:</Text><Text>{chef.chefProfile.yearsOfExperience || 'N/A'}</Text>
          </SimpleGrid>

          {chef.chefProfile.portfolioImages && chef.chefProfile.portfolioImages.length > 0 && (
            <Stack mt="xl">
              <Title order={5}>Portfolio Images</Title>
              <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
                {chef.chefProfile.portfolioImages.map((imageUrl, index) => (
                  <Paper key={index} withBorder shadow="xs" radius="md" p="xs">
                    <Image src={imageUrl} alt={`Portfolio Image ${index + 1}`} fit="cover" height={200} />
                  </Paper>
                ))}
              </SimpleGrid>
            </Stack>
          )}
        </Paper>
      )}
    </Container>
  );
}
