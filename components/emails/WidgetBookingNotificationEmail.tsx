import { Text, Hr } from "@react-email/components";
import * as React from "react";
import { EmailTemplate } from "./EmailTemplate";

interface WidgetBookingNotificationEmailProps {
  name: string;
  phone: string;
  location: string;
  bookingDate: string;
  partnerUrl?: string;
}

const strong = {
  fontWeight: "bold",
};

export const WidgetBookingNotificationEmail = ({
  name,
  phone,
  location,
  bookingDate,
  partnerUrl,
}: WidgetBookingNotificationEmailProps) => (
  <EmailTemplate
    preview="New Partner Booking Request"
    title="New Booking via Partner Widget"
  >
    <Text style={{ color: "#525f7f", fontSize: "16px", lineHeight: "24px" }}>
      A new chef booking request has been submitted through a partner website.
    </Text>
    <Hr style={{ borderColor: "#e6ebf1", margin: "20px 0" }} />
    <Text style={{ color: "#525f7f", fontSize: "16px", lineHeight: "24px" }}>
      <span style={strong}>Client Name:</span> {name}
    </Text>
    <Text style={{ color: "#525f7f", fontSize: "16px", lineHeight: "24px" }}>
      <span style={strong}>Phone Number:</span> {phone}
    </Text>
    <Text style={{ color: "#525f7f", fontSize: "16px", lineHeight: "24px" }}>
      <span style={strong}>Location / Hotel:</span> {location}
    </Text>
    <Text style={{ color: "#525f7f", fontSize: "16px", lineHeight: "24px" }}>
      <span style={strong}>Requested Date & Time:</span> {new Date(bookingDate).toLocaleString()}
    </Text>
    {partnerUrl && (
      <Text style={{ color: "#525f7f", fontSize: "16px", lineHeight: "24px" }}>
        <span style={strong}>Source (Partner URL):</span> {partnerUrl}
      </Text>
    )}
  </EmailTemplate>
);
