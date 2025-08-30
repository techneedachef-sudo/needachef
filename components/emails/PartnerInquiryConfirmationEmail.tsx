import { Text } from "@react-email/components";
import * as React from "react";
import { EmailTemplate } from "./EmailTemplate";

interface PartnerInquiryConfirmationEmailProps {
  contactName: string;
  companyName: string;
}

export const PartnerInquiryConfirmationEmail = ({
  contactName = "Valued Partner",
  companyName = "your company",
}: PartnerInquiryConfirmationEmailProps) => (
  <EmailTemplate
    preview="Your partnership inquiry has been received."
    title="Partnership Inquiry Received"
  >
    <Text style={{ color: "#525f7f", fontSize: "16px", lineHeight: "24px" }}>
      Hello {contactName},
    </Text>
    <Text style={{ color: "#525f7f", fontSize: "16px", lineHeight: "24px" }}>
      Thank you for your interest in partnering with Needachef. We have received your inquiry for {companyName}.
    </Text>
    <Text style={{ color: "#525f7f", fontSize: "16px", lineHeight: "24px" }}>
      A member of our partnerships team will review your message and reach out to you shortly to discuss the opportunity.
    </Text>
    <Text style={{ color: "#525f7f", fontSize: "16px", lineHeight: "24px" }}>
      We look forward to the possibility of working together.
      <br />
      The Needachef Team
    </Text>
  </EmailTemplate>
);
