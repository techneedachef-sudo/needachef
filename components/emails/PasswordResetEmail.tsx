import { Text, Button } from "@react-email/components";
import * as React from "react";
import { EmailTemplate } from "./EmailTemplate";

interface PasswordResetEmailProps {
  userName?: string;
  resetUrl: string;
}

const button = {
  backgroundColor: "#f59f00", // orange-5
  borderRadius: "4px",
  color: "#ffffff",
  fontSize: "15px",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  width: "210px",
  padding: "14px 7px",
};

export const PasswordResetEmail = ({
  userName = "Valued User",
  resetUrl,
}: PasswordResetEmailProps) => (
  <EmailTemplate
    preview="Reset your Needachef password."
    title="Password Reset Request"
  >
    <Text style={{ color: "#525f7f", fontSize: "16px", lineHeight: "24px" }}>
      Hello {userName},
    </Text>
    <Text style={{ color: "#525f7f", fontSize: "16px", lineHeight: "24px" }}>
      Someone has requested a password reset for your Needachef account. If this was you, please click the button below to set a new password.
    </Text>
    
    <Button style={button} href={resetUrl}>
      Reset Your Password
    </Button>

    <Text style={{ color: "#525f7f", fontSize: "16px", lineHeight: "24px" }}>
      If you did not request a password reset, please ignore this email.
    </Text>
    <Text style={{ color: "#525f7f", fontSize: "16px", lineHeight: "24px" }}>
      Best regards,
      <br />
      The Needachef Team
    </Text>
  </EmailTemplate>
);
