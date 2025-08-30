import { Text, Button } from "@react-email/components";
import * as React from "react";
import { EmailTemplate } from "./EmailTemplate";

interface ChefApplicationApprovedEmailProps {
  fullName: string;
  email: string;
}

export const ChefApplicationApprovedEmail = ({
  fullName = "Valued Chef",
  email,
}: ChefApplicationApprovedEmailProps) => (
  <EmailTemplate
    preview="Congratulations! Your Needachef application has been approved."
    title="Welcome to Needachef!"
  >
    <Text style={{ color: "#525f7f", fontSize: "16px", lineHeight: "24px" }}>
      Hello {fullName},
    </Text>
    <Text style={{ color: "#525f7f", fontSize: "16px", lineHeight: "24px" }}>
      We are thrilled to inform you that your application to join the Needachef team has been **approved**!
    </Text>
    <Text style={{ color: "#525f7f", fontSize: "16px", lineHeight: "24px" }}>
      Your user role has been updated to **Chef**, and your Chef Profile has been created. You can now log in and start managing your services and bookings.
    </Text>
    <Button
      href="https://www.needachef.com/dashboard/chef-panel" // Replace with actual chef dashboard URL
      style={{
        background: "#5e60ce",
        color: "#ffffff",
        padding: "12px 20px",
        borderRadius: "8px",
        textDecoration: "none",
        fontSize: "16px",
      }}
    >
      Go to Your Chef Dashboard
    </Button>
    <Text style={{ color: "#525f7f", fontSize: "16px", lineHeight: "24px", marginTop: "20px" }}>
      Best regards,
      <br />
      The Needachef Team
    </Text>
  </EmailTemplate>
);
