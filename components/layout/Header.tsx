"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Container,
  Group,
  Burger,
  Button,
  Drawer,
  Stack,
  useMantineTheme,
  useMantineColorScheme,
  Divider,
  Box,
  Text,
  Menu,
  Avatar,
  rem,
  Indicator,
} from "@mantine/core";
import { useDisclosure, useWindowScroll, useMediaQuery } from "@mantine/hooks";
import { IconChefHat, IconBrandWhatsapp, IconLogout, IconUserCircle, IconShoppingCart, IconDashboard } from "@tabler/icons-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import classes from "./Header.module.css";
import { ThemeToggle } from "../general/ThemeToggle";
import { useAuth } from "../auth/AuthProvider";
import { useCart } from "../cart/CartContext";

const links = [
  { link: "/services", label: "Our Services" },
  { link: "/courses", label: "Online Courses" },
  { link: "/chefs/apply", label: "Join as a Chef" },
  { link: "/partners", label: "Partners", visibleFrom: "md" },
];

export function Header() {
  const [opened, { toggle, close }] = useDisclosure(false);
  const [scrolled, setScrolled] = useState(false);
  const [scroll] = useWindowScroll();
  const pathname = usePathname();
  const router = useRouter();
  const theme = useMantineTheme();
  const { colorScheme } = useMantineColorScheme();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.md})`);
  const { user, isLoading, mutate } = useAuth();
  const { state: cartState } = useCart();

  const cartItemCount = cartState.items.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    if (!isMobile) {
      close();
    }
  }, [isMobile, close]);

  useEffect(() => {
    setScrolled(scroll.y > 50);
  }, [scroll.y]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    mutate(); // Re-fetch user data, which will be null
    router.push('/');
  };

  const dark = colorScheme === "dark";

  const mainItems = links.map((link) => {
    const linkContent = (
      <Link key={link.label} href={link.link} className={classes.link}>
        {link.label}
        {pathname === link.link && (
          <motion.span
            className={classes.linkUnderline}
            layoutId="underline"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          />
        )}
      </Link>
    );

    if (link.visibleFrom) {
      return (
        <Box key={link.label} visibleFrom={link.visibleFrom}>
          {linkContent}
        </Box>
      );
    }

    return linkContent;
  });

  const drawerItems = links.map((link, index) => (
    <motion.div
      key={link.label}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0, transition: { delay: 0.1 * index + 0.2 } }}
    >
      <Link
        href={link.link}
        className={classes.drawerLink}
        data-active={pathname === link.link || undefined}
        onClick={close}
      >
        {link.label}
      </Link>
    </motion.div>
  ));

  let dashboardUrl = '/dashboard';
  if (user) {
    if (user.role === 'ADMIN') {
      dashboardUrl = '/admin/dashboard';
    } else if (user.role === 'PARTNER') {
      dashboardUrl = '/partner/dashboard';
    }
  }

  const MenuComponent = Menu as unknown as React.FC<any>;

  const authSection = user ? (
    <MenuComponent shadow="md" width={200}>
    <Menu.Target>
      <Group style={{ cursor: 'pointer' }}>
        <Avatar src={user.profilePicture} color="orange" radius="xl">{user.name.charAt(0)}</Avatar>
        <Text size="sm" fw={500}>{user.name}</Text>
      </Group>
    </Menu.Target>
    <Menu.Dropdown>
      <Menu.Label>My Account</Menu.Label>
      <Menu.Item
        component={Link}
        href={dashboardUrl}
        leftSection={<IconDashboard style={{ width: rem(14), height: rem(14) }} />}
      >
        My Dashboard
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item
        color="red"
        leftSection={<IconLogout style={{ width: rem(14), height: rem(14) }} />}
        onClick={handleLogout}
      >
        Logout
      </Menu.Item>
    </Menu.Dropdown>
  </MenuComponent>
  ) : (
    <Group>
      <Button component={Link} href="/login" variant="default">Log in</Button>
      <Button component={Link} href="/signup">Sign up</Button>
    </Group>
  );

  const AnimatePresenceFixed = AnimatePresence as unknown as React.FC<any>;

  return (
    <>
      <motion.header
        className={classes.header}
        data-scrolled={scrolled}
        animate={{
          height: scrolled ? 65 : 75,
          backdropFilter: scrolled ? "blur(10px)" : "none",
          borderBottom: scrolled
            ? `1px solid ${dark ? theme.colors.dark[5] : theme.colors.gray[2]}`
            : "none",
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <Container size="lg" className={classes.inner}>
          <Link href="/" className={classes.logoLink}>
            <Group align="center" gap="xs">
              <IconChefHat size={30} className={classes.logoIcon} />
              <span className={classes.logoName}>Needachef</span>
            </Group>
          </Link>
          <Group gap="md" visibleFrom="md">
            <AnimatePresenceFixed>{mainItems}</AnimatePresenceFixed>
          </Group>
          <Group gap="sm" visibleFrom="md">
            <ThemeToggle />
            <Indicator inline label={cartItemCount} size={16} disabled={cartItemCount === 0}>
                <Button component={Link} href="/cart" variant="subtle" leftSection={<IconShoppingCart size="1.25rem" />}>
                    Cart
                </Button>
            </Indicator>
            {!isLoading && authSection}
          </Group>
          <Burger
            opened={opened}
            onClick={toggle}
            hiddenFrom="md"
            size="sm"
            aria-label="Toggle navigation"
          />
        </Container>
      </motion.header>

      <Drawer
        opened={opened}
        onClose={close}
        size="100%"
        padding={0}
        withCloseButton={false}
        zIndex={2000}
        transitionProps={{ transition: "pop-top-right", duration: 200 }}
      >
        <Box className={classes.drawerContent}>
          <Group justify="space-between" className={classes.drawerHeader}>
            <Link href="/" className={classes.logoLink} onClick={close}>
              <Group align="center" gap="xs">
                <IconChefHat size={30} className={classes.logoIcon} />
                <span className={classes.logoName}>Needachef</span>
              </Group>
            </Link>
            <Burger opened={opened} onClick={close} size="sm" />
          </Group>
          <Stack
            justify="center"
            gap="lg"
            className={classes.drawerLinksContainer}
          >
            {drawerItems}
          </Stack>
          <Box className={classes.drawerFooter}>
            <Divider my="md" />
            <Stack>
              <Button
                component="a"
                href="https://wa.me/2348064950555"
                target="_blank"
                variant="subtle"
                leftSection={<IconBrandWhatsapp size="1.25rem" />}
                fullWidth
              >
                WhatsApp
              </Button>
              {!isLoading && (user ? (
                <>
                  <Button component={Link} href={dashboardUrl} variant="default" fullWidth onClick={close}>My Dashboard</Button>
                  <Button variant="outline" color="red" onClick={handleLogout} fullWidth>Logout</Button>
                </>
              ) : (
                <>
                  <Button component={Link} href="/login" variant="default" fullWidth onClick={close}>Log in</Button>
                  <Button component={Link} href="/signup" fullWidth onClick={close}>Sign up</Button>
                </>
              ))}
            </Stack>
          </Box>
        </Box>
      </Drawer>
    </>
  );
}
