// C:/Users/hp/needachef/components/partner/PartnerSidebar.tsx
"use client";

import { NavLink, Divider } from '@mantine/core';
import {
  IconGauge,
  IconChartBar,
  IconSettings,
  IconLogout,
  IconHome,
  IconCode,
} from '@tabler/icons-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../auth/AuthProvider';
import classes from './PartnerLayout.module.css';

const navLinks = [
  { href: '/partner/dashboard', label: 'Dashboard', icon: IconGauge },
  { href: '/partner/referrals', label: 'Referrals', icon: IconChartBar },
  { href: '/partner/dashboard/widget-instructions', label: 'Widget Instructions', icon: IconCode },
  { href: '/partner/settings', label: 'Settings', icon: IconSettings },
];

export function PartnerSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { mutate } = useAuth();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    mutate(); // Re-fetch auth context, which will be null
    router.push('/login');
  };

  const links = navLinks.map((link) => (
    <NavLink
      key={link.label}
      component={Link}
      href={link.href}
      label={link.label}
      leftSection={<link.icon size="1rem" stroke={1.5} />}
      active={pathname.startsWith(link.href)}
      className={classes.navLink}
    />
  ));

  return (
    <div>
      {links}
      <Divider my="md" />
      <NavLink
        href="/"
        label="Back to Main Site"
        component={Link}
        leftSection={<IconHome size="1rem" stroke={1.5} />}
        className={classes.navLink}
      />
      <NavLink
        label="Logout"
        leftSection={<IconLogout size="1rem" stroke={1.5} />}
        className={classes.navLink}
        color="red"
        onClick={handleLogout}
      />
    </div>
  );
}