import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Text,
  Section,
} from "@react-email/components";
import * as React from "react";

interface BookingConfirmationEmailProps {
  bookingId: string;
  bookingDate: string;
  customerName: string;
  serviceName: string;
  amount: number;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const BookingConfirmationEmail = ({
  bookingId,
  bookingDate,
  customerName,
  serviceName,
  amount,
}: BookingConfirmationEmailProps) => (
  <Html>
    <Head />
    <Preview>Your NeedAChef Booking Confirmation</Preview>
    <Body style={main}>
      <Container style={container}>
        <Img
          src={`${baseUrl}/logo.png`}
          width="150"
          height="50"
          alt="NeedAChef"
          style={logo}
        />
        <Heading style={h1}>Booking Confirmed!</Heading>
        <Text style={text}>
          Hello {customerName},
        </Text>
        <Text style={text}>
          Thank you for booking with NeedAChef. Your payment has been successful and your booking is confirmed.
        </Text>
        <Section style={detailsSection}>
          <Text style={detailsTitle}>Booking Details:</Text>
          <Text style={detailsText}><strong>Booking ID:</strong> {bookingId}</Text>
          <Text style={detailsText}><strong>Booking Date:</strong> {bookingDate}</Text>
          <Text style={detailsText}><strong>Service:</strong> {serviceName}</Text>
          <Text style={detailsText}><strong>Amount Paid:</strong> ₦{amount.toLocaleString()}</Text>
        </Section>
        <Text style={text}>
          We are excited to be a part of your event. Our team will be in touch with you shortly to finalize the details.
        </Text>
        <Text style={text}>
          If you have any questions, please don&apos;t hesitate to contact us.
        </Text>
        <Link
          href={`${baseUrl}/dashboard/bookings`}
          style={button}
        >
          View Your Bookings
        </Link>
        <Text style={footer}>
          NeedAChef | Your Personal Culinary Solution
        </Text>
      </Container>
    </Body>
  </Html>
);

export default BookingConfirmationEmail;

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
};

const logo = {
  margin: "0 auto",
};

const h1 = {
  color: "#333",
  fontSize: "24px",
  fontWeight: "bold",
  textAlign: "center" as const,
  margin: "30px 0",
};

const text = {
  color: "#555",
  fontSize: "16px",
  lineHeight: "26px",
  margin: "16px 0",
  padding: "0 20px",
};

const detailsSection = {
  backgroundColor: "#f0f4f8",
  padding: "20px",
  margin: "20px 0",
  borderRadius: "8px",
};

const detailsTitle = {
  fontSize: "18px",
  fontWeight: "bold",
  margin: "0 0 10px 0",
};

const detailsText = {
  fontSize: "16px",
  lineHeight: "24px",
  margin: "4px 0",
};

const button = {
  backgroundColor: "#ff6f61",
  borderRadius: "5px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  width: "200px",
  padding: "12px",
  margin: "32px auto",
};

const footer = {
  color: "#8898aa",
  fontSize: "12px",
  lineHeight: "16px",
  textAlign: "center" as const,
  marginTop: "20px",
};
