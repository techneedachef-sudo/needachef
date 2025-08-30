"use client";

import { useForm } from "@mantine/form";
import { TextInput, Textarea, Button, Box, LoadingOverlay } from "@mantine/core";
import { useState } from "react";
import { handleApiError } from "@/utils/errorHandler";
import { showSuccessNotification } from "@/utils/successHandler";

export function PartnerInquiryForm() {
  const [loading, setLoading] = useState(false);
  const form = useForm({
    initialValues: {
      companyName: "",
      contactName: "",
      email: "",
      phone: "",
      message: "",
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email"),
      contactName: (value) =>
        value.trim().length < 2 ? "Name must have at least 2 letters" : null,
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    try {
      const response = await fetch("/api/partner-inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        showSuccessNotification("Your inquiry has been sent!");
        form.reset();
      } else {
        throw new Error("Server error, please try again.");
      }
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box pos="relative">
      <LoadingOverlay visible={loading} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <TextInput
          label="Company Name"
          placeholder="Your company's name"
          {...form.getInputProps("companyName")}
        />
        <TextInput
          mt="md"
          label="Contact Name"
          placeholder="Your name"
          required
          {...form.getInputProps("contactName")}
        />
        <TextInput
          mt="md"
          label="Email"
          placeholder="your@email.com"
          required
          {...form.getInputProps("email")}
        />
        <TextInput
          mt="md"
          label="Phone Number"
          placeholder="+1234567890"
          {...form.getInputProps("phone")}
        />
        <Textarea
          mt="md"
          label="Message"
          placeholder="Tell us about your partnership idea"
          rows={7}
          {...form.getInputProps("message")}
        />
        <Button type="submit" mt="xl" fullWidth>
          Submit Inquiry
        </Button>
      </form>
    </Box>
  );
}