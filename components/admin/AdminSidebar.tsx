"use client";

import { NavLink, Divider } from "@mantine/core";
import {
  IconGauge,
  IconChefHat,
  IconBuildingStore,
  IconShoppingCart,
  IconCertificate,
  IconFileText,
  IconSettings,
  IconToolsKitchen2,
  IconCalendarEvent,
  IconUsers,
  IconHome,
  IconLogout,
} from "@tabler/icons-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../auth/AuthProvider";
import classes from "./AdminLayout.module.css";

const navLinks = [
  { href: "/admin/dashboard", label: "Dashboard", icon: IconGauge },
  { href: "/admin/services", label: "Services", icon: IconToolsKitchen2 },
  { href: "/admin/bookings", label: "Bookings", icon: IconCalendarEvent },
  { href: "/admin/users", label: "User Management", icon: IconUsers },
  { href: "/admin/chefs", label: "Chef Management", icon: IconChefHat },
  { href: "/admin/partners", label: "Partner Management", icon: IconBuildingStore },
  { href: "/admin/ecommerce", label: "eCommerce", icon: IconShoppingCart },
  { href: "/admin/courses", label: "Courses", icon: IconCertificate },
  { href: "/admin/content", label: "Website Content", icon: IconFileText },
  { href: "/admin/settings", label: "Settings", icon: IconSettings },
];

export function AdminSidebar({ onLinkClick }: { onLinkClick?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { mutate } = useAuth();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    mutate(); // Re-fetch user data, which will be null
    router.push('/login'); // Redirect to admin login
    onLinkClick?.(); // Close sidebar on logout
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
      onClick={onLinkClick} // Add onClick to close sidebar
    />
  ));

  return (
    <div className="bg-white">
        {links}
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