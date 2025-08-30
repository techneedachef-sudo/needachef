"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Container,
  Title,
  Text,
  Button,
  Loader,
  Alert,
  Accordion,
  Textarea,
  TextInput,
  JsonInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconAlertCircle, IconDeviceFloppy } from "@tabler/icons-react";

// This interface should match the structure of your content.json
interface Testimonial {
  name: string;
  title: string;
  review: string;
}
interface PageContent {
  homepage: {
    hero: {
      title: string;
      subtitle: string;
    };
    services: {
      title: string;
      description: string;
    };
  };
  servicesPage: {
    title: string;
    intro: string;
  };
  testimonials: Testimonial[];
}

// This interface represents the data structure for the form state,
// where testimonials is a string to be used by JsonInput.
interface ContentManagementFormValues extends Omit<PageContent, 'testimonials'> {
  testimonials: string;
}

export default function ContentManagementPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const form = useForm<ContentManagementFormValues>();

  const fetchContent = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/content");
      if (!res.ok) throw new Error("Failed to fetch content.");
      const data: PageContent = await res.json();
      // Convert testimonials array to a formatted JSON string for the JsonInput
      form.setValues({
        ...data,
        testimonials: JSON.stringify(data.testimonials, null, 2),
      });
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred.");
      }
    } finally {
      setLoading(false);
    }
  }, [form]);

  useEffect(() => {
    fetchContent();
  }, []);

  const handleSubmit = async (values: ContentManagementFormValues) => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      // Parse the testimonials string back into an array before sending to the API
      const payload: PageContent = {
        ...values,
        testimonials: JSON.parse(values.testimonials),
      };

      const response = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Failed to save content.');
      setSuccess("Content saved successfully!");
    } catch (err) {
      if (err instanceof SyntaxError) {
        setError("The testimonials JSON is invalid. Please correct the syntax.");
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred while saving.");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container fluid>
      <Title order={2}>Website Content Management</Title>
      <Text c="dimmed">Edit the text content displayed on your website pages.</Text>

      {loading && <Loader my="xl" />}
      {error && <Alert color="red" title="Error" icon={<IconAlertCircle />} my="xl" withCloseButton onClose={() => setError(null)}>{error}</Alert>}
      {success && <Alert color="green" title="Success" my="xl" withCloseButton onClose={() => setSuccess(null)}>{success}</Alert>}

      {!loading && (
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Accordion defaultValue="homepage" mt="xl">
            <Accordion.Item value="homepage">
              <Accordion.Control>Homepage Content</Accordion.Control>
              <Accordion.Panel>
                <Title order={4} my="md">Hero Section</Title>
                <TextInput label="Title" {...form.getInputProps('homepage.hero.title')} />
                <Textarea label="Subtitle" {...form.getInputProps('homepage.hero.subtitle')} mt="sm" />

                <Title order={4} my="md" mt="lg">Services Section</Title>
                <TextInput label="Title" {...form.getInputProps('homepage.services.title')} />
                <Textarea label="Description" {...form.getInputProps('homepage.services.description')} mt="sm" />
              </Accordion.Panel>
            </Accordion.Item>

            <Accordion.Item value="servicesPage">
              <Accordion.Control>Services Page</Accordion.Control>
              <Accordion.Panel>
                <TextInput label="Page Title" {...form.getInputProps('servicesPage.title')} />
                <Textarea label="Intro Text" {...form.getInputProps('servicesPage.intro')} mt="sm" />
              </Accordion.Panel>
            </Accordion.Item>

            <Accordion.Item value="testimonials">
              <Accordion.Control>Testimonials</Accordion.Control>
              <Accordion.Panel>
                <Text size="sm" c="dimmed" mb="md">
                  Edit the list of testimonials. This is in JSON format. Be careful with the syntax.
                </Text>
                <JsonInput
                  label="Testimonials Data"
                  formatOnBlur
                  autosize
                  minRows={10}
                  {...form.getInputProps('testimonials')}
                />
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion>

          <Button
            type="submit"
            mt="xl"
            loading={saving}
            leftSection={<IconDeviceFloppy size={16} />}
          >
            Save All Content
          </Button>
        </form>
      )}
    </Container>
  );
}