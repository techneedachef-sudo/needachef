import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { MantineProvider, ColorSchemeScript, Flex } from "@mantine/core";
import { Notifications } from '@mantine/notifications';
import { theme } from '../theme';
import { AuthProvider } from "@/components/auth/AuthProvider";
import { CartProvider } from "@/components/cart/CartContext";
import Script from "next/script";
import { LearningProvider } from "@/components/learning/LearningContext";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import '@mantine/dates/styles.css';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Needachef",
  description: "Connecting clients with professional chefs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <ColorSchemeScript defaultColorScheme="auto" />
      </head>
      <body className={inter.className}>
        <MantineProvider theme={theme} defaultColorScheme="auto">
          <Notifications />
          <AuthProvider>
            <CartProvider>
              <LearningProvider>
                <Flex direction="column" style={{ minHeight: '100vh' }}>
                  <div style={{ flex: 1 }}>
                    {children}
                  </div>
                </Flex>
              </LearningProvider>
            </CartProvider>
          </AuthProvider>
        </MantineProvider>
        <Script src="https://js.paystack.co/v1/inline.js" />
      </body>
    </html>
  );
}

