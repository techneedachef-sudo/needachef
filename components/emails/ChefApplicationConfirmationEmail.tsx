import { Text } from "@react-email/components";
import * as React from "react";
import { EmailTemplate } from "./EmailTemplate";

interface ChefApplicationConfirmationEmailProps {
  fullName: string;
}

export const ChefApplicationConfirmationEmail = ({
  fullName = "Valued Applicant",
}: ChefApplicationConfirmationEmailProps) => (
  <EmailTemplate
    preview="Your Needachef application has been received."
    title="Application Received!"
  >
    <Text style={{ color: "#525f7f", fontSize: "16px", lineHeight: "24px" }}>
      Hello {fullName},
    </Text>
    <Text style={{ color: "#525f7f", fontSize: "16px", lineHeight: "24px" }}>
      Thank you for submitting your application to join the Needachef team. We are excited to learn more about your culinary talents.
    </Text>
    <Text style={{ color: "#525f7f", fontSize: "16px", lineHeight: "24px" }}>
      Our team will carefully review your submission and will get back to you within 3-5 business days.
    </Text>
    <Text style={{ color: "#525f7f", fontSize: "16px", lineHeight: "24px" }}>
      Best regards,
      <br />
      The Needachef Team
    </Text>
  </EmailTemplate>
);
