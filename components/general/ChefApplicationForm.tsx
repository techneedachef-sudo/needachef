"use client";

import { useState, useEffect } from "react";
import { useForm } from "@mantine/form";
import {
  Button,
  Group,
  Stepper,
  TextInput,
  Select,
  Textarea,
  FileInput,
  LoadingOverlay,
} from "@mantine/core";
import { IconUser, IconToolsKitchen2, IconUpload } from "@tabler/icons-react";
import { handleApiError } from "@/utils/errorHandler";
import { showSuccessNotification } from "@/utils/successHandler";
import { useAuth } from "@/components/auth/AuthProvider";
import { useRouter } from "next/navigation";
import { useUserDashboardData } from "@/components/dashboard/hooks/useUserDashboardData";

export function ChefApplicationForm() {
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(false);
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const { hasChefApplication } = useUserDashboardData();

  // Redirect logic based on user status
  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.replace("/login");
      } else if (user.role === 'CHEF') {
        router.replace("/dashboard/chef-panel");
      } else if (hasChefApplication) {
        router.replace("/dashboard/chef-application");
      }
    }
  }, [user, isLoading, router, hasChefApplication]);

  if (isLoading || !user || user.role === 'CHEF' || hasChefApplication) {
    return null; // Or a loading spinner/message
  }

  const form = useForm({
    initialValues: {
      fullName: "",
      email: "",
      phone: "",
      chefLevel: "",
      experience: "",
      bio: "",
      resume: null,
    },
    validate: (values) => {
      if (active === 0) {
        return {
          fullName:
            values.fullName.trim().length < 2
              ? "Full name must include at least 2 characters"
              : null,
          email: /^\S+@\S+$/.test(values.email) ? null : "Invalid email",
          phone: /^\+?[0-9]{10,14}$/.test(values.phone)
            ? null
            : "Invalid phone number",
        };
      }
      if (active === 1) {
        return {
          chefLevel:
            values.chefLevel === "" ? "Please select your chef level" : null,
          experience: /^\d+$/.test(values.experience)
            ? null
            : "Years of experience must be a number",
        };
      }
      return {};
    },
  });

  const nextStep = () =>
    setActive((current) => {
      if (form.validate().hasErrors) {
        return current;
      }
      return current < 3 ? current + 1 : current;
    });

  const prevStep = () =>
    setActive((current) => (current > 0 ? current - 1 : current));

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    try {
      let resumeUrl = null;
      if (values.resume) {
        const resumeFile = values.resume as File;
        const uploadResponse = await fetch(
          `/api/upload?filename=${resumeFile.name}`,
          {
            method: "POST",
            body: resumeFile,
          }
        );

        if (!uploadResponse.ok) {
          throw new Error("Failed to upload resume.");
        }

        const uploadResult = await uploadResponse.json();
        resumeUrl = uploadResult.url;
      }

      const applicationData = { ...values, resume: resumeUrl };

      const response = await fetch("/api/apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(applicationData),
      });

      if (response.ok) {
        showSuccessNotification("Your application has been submitted!");
        form.reset();
        setActive(0);
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
    <div style={{ position: 'relative' }}>
      <LoadingOverlay visible={loading} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />
      <Stepper active={active} onStepClick={setActive}>
        <Stepper.Step
          className="pt-[1rem] md:!py-[2rem]"
          label="Personal Details"
          description="Profile information"
          icon={<IconUser />}
        >
          <TextInput
            label="Full Name"
            placeholder="John Doe"
            {...form.getInputProps("fullName")}
            required
          />
          <TextInput
            mt="md"
            label="Email"
            placeholder="your@email.com"
            {...form.getInputProps("email")}
            required
          />
          <TextInput
            mt="md"
            label="Phone Number"
            placeholder="+1234567890"
            {...form.getInputProps("phone")}
            required
          />
        </Stepper.Step>
        <Stepper.Step
          className="md:!py-[2rem]"
          label="Professional Experience"
          description="Your culinary background"
          icon={<IconToolsKitchen2 />}
        >
          <Select
            label="Chef Level"
            placeholder="Select your level"
            data={[
              "Executive Chef",
              "Sous Chef",
              "Chef de Partie",
              "Personal / Private Chef",
              "Junior Chef / Commis Chef",
              "Kitchen Assistant / Steward",
            ]}
            {...form.getInputProps("chefLevel")}
            required
          />
          <TextInput
            mt="md"
            label="Years of Experience"
            placeholder="5"
            {...form.getInputProps("experience")}
            required
          />
          <Textarea
            mt="md"
            label="Short Bio"
            rows={7}
            placeholder="Tell us about your culinary passion and style."
            {...form.getInputProps("bio")}
          />
        </Stepper.Step>
        <Stepper.Step
          className="md:!py-[2rem] pb-[1rem]"
          label="Upload Documents"
          description="Resume / CV"
          icon={<IconUpload />}
        >
          <FileInput
            label="Upload Resume/CV"
            placeholder="Your resume"
            required
            {...form.getInputProps("resume")}
          />
        </Stepper.Step>
        </Stepper>

        <Group justify="center" mt="xl">
        {active > 0 && (
          <Button variant="default" onClick={prevStep}>
            Back
          </Button>
        )}

        {active < 2 && <Button onClick={nextStep}>Next step</Button>}

        {active === 2 && (
          <Button onClick={() => handleSubmit(form.values)}>
            Submit Application
          </Button>
        )}
      </Group>
    </div>
  );
}