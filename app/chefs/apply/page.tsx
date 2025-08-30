"use client";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ChefApplicationForm } from "@/components/general/ChefApplicationForm";
import { Container, Title, Text, Skeleton } from "@mantine/core";
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function ApplyPage() {
  const { data, error } = useSWR('/api/content', fetcher);
  const isLoading = !data && !error;
  const content = data?.chefApplicationPage;

  return (
    <>
      <Header />
      <main>
        <Container size="md" py="xl">
          {isLoading ? <Skeleton height={40} width="60%" mx="auto" /> : (
            <Title order={2} ta="center">
              {content?.title || "Join Our Culinary Team"}
            </Title>
          )}
          
          {isLoading ? (
            <>
                <Skeleton height={12} mt="md" width="80%" mx="auto" />
                <Skeleton height={12} mt="sm" width="70%" mx="auto" />
            </>
          ) : (
            <Text ta="center" c="dimmed" mt="md" mb="xl">
              {content?.intro || "Complete the application below to start your journey with Needachef. We are looking for passionate and talented chefs to join our network."}
            </Text>
          )}
          
          <ChefApplicationForm />
        </Container>
      </main>
      <Footer />
    </>
  );
}
