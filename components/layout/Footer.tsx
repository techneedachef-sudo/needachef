"use client";
import {
  Text,
  Container,
  ActionIcon,
  Group,
  rem,
  Anchor,
  Stack,
  Skeleton,
} from "@mantine/core";
import {
  IconBrandInstagram,
  IconBrandX,
  IconBrandLinkedin,
  IconBrandFacebook,
  IconBrandTiktok,
} from "@tabler/icons-react";
import { IconChefHat } from "@tabler/icons-react";
import Link from "next/link";
import classes from "./Footer.module.css";
import useSWR from 'swr';
import React from "react";

const fetcher = (url: string) => fetch(url).then(res => res.json());

const socialIconMap: Record<string, React.FC<any>> = {
    Instagram: IconBrandInstagram,
    Facebook: IconBrandFacebook,
    X: IconBrandX,
    LinkedIn: IconBrandLinkedin,
    TikTok: IconBrandTiktok,
};

export function Footer() {
  const { data, error } = useSWR('/api/content', fetcher);
  const isLoading = !data && !error;
  const footerData = data?.footer;

  const socialLinks = footerData?.socials.map((social: { name: string, url: string }) => {
    const Icon = socialIconMap[social.name];
    return Icon ? (
      <ActionIcon key={social.name} size="lg" component="a" href={social.url} target="_blank" variant="subtle" className={classes.socialIcon}>
        <Icon style={{ width: rem(20), height: rem(20) }} stroke={1.5} />
      </ActionIcon>
    ) : null;
  });

  return (
    <footer className={classes.footer}>
      <Container size="lg" className={classes.inner}>
        <div className={classes.logoSection}>
          <Link href="/" className={classes.logo}>
            <Group>
              <IconChefHat size={32} />
              <Text className={classes.logoName}>Needachef</Text>
            </Group>
          </Link>
          <Text c="dimmed" size="sm" mt="sm">
            Your trusted partner for professional culinary and hospitality
            solutions.
          </Text>
        </div>

        <div className={classes.linksSection}>
          <div className={classes.linksWrapper}>
            <Text className={classes.title}>Our Services</Text>
            <Stack gap="xs" mt="md">
              <Anchor component={Link} href="/services" className={classes.link}>Private Chefs</Anchor>
              <Anchor component={Link} href="/services" className={classes.link}>Event Staffing</Anchor>
              <Anchor component={Link} href="/services" className={classes.link}>Culinary Consulting</Anchor>
            </Stack>
          </div>

          <div className={classes.linksWrapper}>
            <Text className={classes.title}>Company</Text>
            <Stack gap="xs" mt="md">
              <Anchor component={Link} href="#" className={classes.link}>About Us</Anchor>
              <Anchor component={Link} href="/chefs/apply" className={classes.link}>Join as a Chef</Anchor>
              <Anchor component={Link} href="/partners" className={classes.link}>Partners</Anchor>
            </Stack>
          </div>

          <div className={classes.linksWrapper}>
            <Text className={classes.title}>Get in Touch</Text>
            <Stack gap="xs" mt="md">
              {isLoading ? (
                <>
                    <Skeleton height={12} width="80%" />
                    <Skeleton height={12} width="60%" mt="sm" />
                </>
              ) : (
                <>
                    <Anchor href={`mailto:${footerData?.contact.email}`} className={classes.link}>{footerData?.contact.email}</Anchor>
                    <Anchor href={`tel:${footerData?.contact.phone}`} className={classes.link}>{footerData?.contact.phone}</Anchor>
                </>
              )}
              <Group gap="xs" mt="xs">
                {isLoading ? <Skeleton height={36} width={160} /> : socialLinks}
              </Group>
            </Stack>
          </div>
        </div>
      </Container>
      <Container className={classes.afterFooter}>
        <Text c="dimmed" size="sm" ta="center">
          © {new Date().getFullYear()} Needachef. All rights reserved.
        </Text>
      </Container>
    </footer>
  );
}
