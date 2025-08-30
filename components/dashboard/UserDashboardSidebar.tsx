"use client";

import { NavLink, Divider, Button } from "@mantine/core";
import {
  IconUserCircle,
  IconCalendarEvent,
  IconPackage,
  IconBook,
  IconChefHat,
  IconDashboard,
  IconHome,
  IconPencil,
  IconLogout,
} from "@tabler/icons-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import classes from "./UserDashboardLayout.module.css";
import { useAuth } from "../auth/AuthProvider";
import { useUserDashboardData } from "./hooks/useUserDashboardData";

export function UserDashboardSidebar({ onLinkClick }: { onLinkClick?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { mutate } = useAuth();
  const { hasBookings, hasOrders, hasChefApplication, isApprovedChef, noApplicationExists } = useUserDashboardData();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    mutate(); // Re-fetch user data, which will be null
    router.push('/');
    onLinkClick?.(); // Close sidebar on logout
  };

  const navLinks = [
    { href: "/dashboard", label: "Overview", icon: IconDashboard, exact: true },
    { href: "/dashboard/profile", label: "My Profile", icon: IconUserCircle },
    { href: "/dashboard/bookings", label: "My Bookings", icon: IconCalendarEvent, show: hasBookings },
    { href: "/dashboard/orders", label: "My Orders", icon: IconPackage, show: hasOrders },
    { href: "/dashboard/learning", label: "My Learning", icon: IconBook },
    { href: "/dashboard/chef-application", label: "View Application", icon: IconChefHat, show: hasChefApplication },
    { href: "/dashboard/chef-panel", label: "Chef Panel", icon: IconChefHat, show: isApprovedChef, isChefPanel: true },
  ];

  const links = navLinks.map((link) => {
    if (link.show === false) return null;

    const active = link.exact ? pathname === link.href : pathname.startsWith(link.href);

    return (
        <NavLink
            key={link.label}
            component={Link}
            href={link.href}
            label={link.label}
            leftSection={<link.icon size="1rem" stroke={1.5} />}
            active={active}
            className={classes.navLink}
            variant={link.isChefPanel ? 'filled' : 'subtle'}
            color={link.isChefPanel ? 'orange' : 'gray'}
            onClick={onLinkClick} // Add onClick to close sidebar
        />
    )
  });

  return (
    <div className="bg-white h-full">
        {links}
        
        {noApplicationExists && !isApprovedChef && (
            <Button
                component={Link}
                href="/chefs/apply"
                fullWidth
                mt="md"
                variant="gradient"
                gradient={{ from: 'orange', to: 'red' }}
                leftSection={<IconPencil size={16} />}
                onClick={onLinkClick} // Add onClick to close sidebar
            >
                Apply to be a Chef
            </Button>
        )}

        <Divider my="md" />
        <NavLink
            href="/"
            label="Back to Main Site"
            component={Link}
            leftSection={<IconHome size="1rem" stroke={1.5} />}
            className={classes.navLink}
            onClick={onLinkClick} // Add onClick to close sidebar
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