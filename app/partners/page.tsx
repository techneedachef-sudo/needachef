"use client";

import { Suspense, useState } from 'react';
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PartnerInquiryForm } from "@/components/general/PartnerInquiryForm";
import {
  Container,
  Title,
  Text,
  Paper,
  Code,
  Group,
  Button,
  Alert,
  Skeleton,
} from "@mantine/core";
import { IconInfoCircle, IconCopy } from "@tabler/icons-react";
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function PartnersPage() {
  const [copied, setCopied] = useState(false);
  const { data, error } = useSWR('/api/content', fetcher);
  const isLoading = !data && !error;
  const content = data?.partnersPage;

  const widgetCode = `<script src="https://needachef.ng/widget.js" async defer></script>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(widgetCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <>
      <Header />
      <main>
        <Container size="lg" className="py-[2rem] md:py-[3.5rem]">
          {isLoading ? <Skeleton height={40} width="60%" mx="auto" /> : (
            <Title order={2} ta="center">
              {content?.title || "Partner with Needachef"}
            </Title>
          )}
          
          {isLoading ? (
            <>
                <Skeleton height={12} mt="md" width="80%" mx="auto" />
                <Skeleton height={12} mt="sm" width="70%" mx="auto" />
            </>
          ) : (
            <Text
                ta="center"
                c="dimmed"
                mt="md"
                mb="xl"
                style={{ maxWidth: 700, margin: "auto" }}
            >
                {content?.intro || "Join our network of partners and offer your clients an exclusive culinary experience. We work with hotels, short-let platforms, and tour operators to provide seamless chef booking services."}
            </Text>
          )}

          <Paper withBorder shadow="md" p="xl" mt="xl" radius="md">
            {isLoading ? <Skeleton height={32} width="50%" /> : (
                <Title order={2} mb="lg">
                    {content?.widgetTitle || "Embed Our Booking Widget"}
                </Title>
            )}
            
            {isLoading ? <Skeleton height={12} width="90%" /> : (
                <Text mb="md">
                    {content?.widgetText || "Add a \"Book a Chef\" button to your website with one simple line of code. It's the easiest way to provide a premium service to your guests and track your referrals."}
                </Text>
            )}
            
            <Alert
              icon={<IconInfoCircle size="1rem" />}
              title={isLoading ? <Skeleton height={16} width="30%" /> : (content?.widgetAlertTitle || "How it Works")}
              color="orange"
              mb="lg"
            >
              {isLoading ? <Skeleton height={12} width="100%" /> : (content?.widgetAlertText || "Our script adds a non-intrusive button to the bottom-right corner of your site. When clicked, a pop-up form appears, allowing users to book a chef without leaving your page. We handle the rest!")}
            </Alert>

            <Paper withBorder p="md" bg="dark.8" radius="sm">
              <Code block fz="sm" c="white">
                {widgetCode}
              </Code>
            </Paper>
            <Group justify="center" mt="lg">
              <Button
                onClick={handleCopy}
                variant="light"
                color={copied ? "teal" : "orange"}
                leftSection={<IconCopy size={16} />}
              >
                {copied ? "Copied!" : "Copy Code"}
              </Button>
            </Group>
          </Paper>

          <Container size="sm" mt={50}>
            {isLoading ? <Skeleton height={32} width="70%" mx="auto" mb="xl" /> : (
                <Title order={2} ta="center" mb="xl">
                    {content?.formTitle || "Become an Official Partner"}
                </Title>
            )}
            <Suspense fallback={<Skeleton height={300} />}>
              <PartnerInquiryForm />
            </Suspense>
          </Container>
        </Container>
      </main>
      <Footer />
    </>
  );
}
