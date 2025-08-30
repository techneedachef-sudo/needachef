"use client";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PricingTiersDisplay } from "@/components/general/PricingTiersDisplay";
import { Container, Title, Text, Skeleton } from "@mantine/core";
import { AnimatedDivider } from "@/components/general/AnimatedDivider";

export default function ServicesPage() {
  return (
    <>
      <Header />
      <main>
        <Container size="lg" className="py-[2rem] md:py-[3.5rem]">
          <Title order={2} ta="center">
            Our Services
          </Title>
          <Text
            ta="center"
            c="dimmed"
            mt="md"
            mb="xl"
            style={{ maxWidth: 600, margin: "auto" }}
          >
            We provide a full spectrum of hospitality solutions, from private chef placements to comprehensive culinary business support. Explore our offerings below.
          </Text>

          <PricingTiersDisplay />
          <AnimatedDivider />
        </Container>
      </main>
      <Footer />
    </>
  );
}
