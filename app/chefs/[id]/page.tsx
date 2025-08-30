"use client";

import { useEffect, useState } from "react";
import {
  Container,
  Title,
  Text,
  Loader,
  Alert,
  Paper,
  Image,
  SimpleGrid,
  Stack,
  Center,
  Breadcrumbs,
  Anchor,
} from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

interface ChefProfile {
  specialties: string[];
  yearsOfExperience: number;
  portfolioImages: string[];
}

interface Chef {
  id: string;
  name: string;
  bio?: string;
  profilePicture?: string;
  chefProfile?: ChefProfile;
}

export default function PublicChefDetailPage() {
  const params = useParams();
  const chefId = params.id as string;
  const [chef, setChef] = useState<Chef | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChefDetails = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/chefs/${chefId}`);
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

  const breadcrumbs = [
    { title: "Home", href: "/" },
    { title: "Chefs", href: "/chefs" },
    { title: chef?.name || "Chef Profile", href: `/chefs/${chefId}` },
  ].map((item, index) => (
    <Anchor component={Link} href={item.href} key={index}>
      {item.title}
    </Anchor>
  ));

  if (loading) {
    return (
      <>
        <Header />
        <Container fluid>
          <Loader my="xl" />
        </Container>
        <Footer />
      </>
    );
  }

  if (error || !chef) {
    return (
      <>
        <Header />
        <Container fluid>
          <Alert color="red" title="Error" icon={<IconAlertCircle />} my="xl">
            {error || "Chef not found."}
          </Alert>
        </Container>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <Container size="lg">
        <Breadcrumbs my="lg">{breadcrumbs}</Breadcrumbs>
        <Title order={1} mb="xl">{chef.name}</Title>

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
          <Title order={4} mb="md">About {chef.name}</Title>
          <Text>{chef.bio || 'No bio available.'}</Text>
        </Paper>

        {chef.chefProfile && (
          <Paper withBorder p="xl" radius="md" mb="xl">
            <Title order={4} mb="md">Specialties & Experience</Title>
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xs">
              <Text fw={700}>Specialties:</Text><Text>{chef.chefProfile.specialties.join(', ') || 'N/A'}</Text>
              <Text fw={700}>Years of Experience:</Text><Text>{chef.chefProfile.yearsOfExperience || 'N/A'}</Text>
            </SimpleGrid>

            {chef.chefProfile.portfolioImages && chef.chefProfile.portfolioImages.length > 0 && (
              <Stack mt="xl">
                <Title order={5}>Portfolio</Title>
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
      <Footer />
    </>
  );
}
