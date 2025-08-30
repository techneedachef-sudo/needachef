import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
  Hr,
} from "@react-email/components";
import * as React from "react";

interface EmailTemplateProps {
  preview: string;
  title: string;
  children: React.ReactNode;
}

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
  border: "1px solid #f0f0f0",
  borderRadius: "4px",
};

const box = {
  padding: "0 48px",
};

const logo = {
  margin: "0 auto",
  width: "150px", // Adjust as needed
};

const heading = {
  fontSize: "24px",
  lineHeight: "1.3",
  fontWeight: "700",
  color: "#484848",
};

const text = {
  color: "#525f7f",
  fontSize: "16px",
  lineHeight: "24px",
};

const footer = {
  color: "#8898aa",
  fontSize: "12px",
  lineHeight: "16px",
};

const hr = {
  borderColor: "#e6ebf1",
  margin: "20px 0",
};

export const EmailTemplate = ({
  preview,
  title,
  children,
}: EmailTemplateProps) => (
  <Html>
    <Head />
    <Preview>{preview}</Preview>
    <Body style={main}>
      <Container style={container}>
        <div style={box}>
          {/* TODO: Replace with your hosted logo URL */}
          {/* <Img
            src="https://example.com/logo.png"
            width="150"
            height="auto"
            alt="Needachef"
            style={logo}
          /> */}
          <Heading style={heading}>{title}</Heading>
          {children}
          <Hr style={hr} />
          <Text style={footer}>
            Needachef | Culinary & Hospitality Solutions
          </Text>
          <Text style={footer}>
            Lagos, Nigeria
          </Text>
        </div>
      </Container>
    </Body>
  </Html>
);
