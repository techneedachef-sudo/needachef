// C:/Users/hp/needachef/components/partner/PartnerLayout.tsx
"use client";

import { AppShell, Burger, Group, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconBuildingStore } from '@tabler/icons-react';
import { PartnerSidebar } from './PartnerSidebar';
import classes from './PartnerLayout.module.css';
import { useAuth } from '../auth/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function PartnerLayout({ children }: { children: React.ReactNode }) {
  const [opened, { toggle }] = useDisclosure();
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Protect the partner routes
    if (!isLoading && (!user || user.role !== 'PARTNER')) {
      router.replace('/login');
    }
  }, [user, isLoading, router]);

  // Render nothing or a loading spinner while checking auth
  if (isLoading || !user) {
    return null;
  }

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 250, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      padding="md"
      className={classes.shell}
    >
      <AppShell.Header className={classes.header}>
        <Group h="100%" px="md">
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
          <IconBuildingStore size={30} />
          <Title order={4}>Partner Portal</Title>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md" className={classes.navbar}>
        <PartnerSidebar />
      </AppShell.Navbar>

      <AppShell.Main className={classes.main}>{children}</AppShell.Main>
    </AppShell>
  );
}