"use client";

import {
  Container,
  Title,
  Text,
  Paper,
  TextInput,
  Button,
  Group,
  Alert,
  Avatar,
  FileInput,
  Textarea,
  Divider,
  NumberInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useAuth } from "@/components/auth/AuthProvider";
import { useState } from "react";
import { notifications } from "@mantine/notifications";
import { IconCheck, IconAlertCircle, IconUpload } from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import { ChangePasswordModal } from "@/components/dashboard/ChangePasswordModal";
import { CreatableMultiSelect } from "@/components/general/CreatableMultiSelect";

export default function MyProfilePage() {
  const { user, mutate } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordModalOpened, { open: openPasswordModal, close: closePasswordModal }] = useDisclosure(false);

  const form = useForm({
    initialValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || '',
      bio: user?.bio || '',
      profilePicture: null,
      specialties: user?.chefProfile?.specialties || [],
      yearsOfExperience: user?.chefProfile?.yearsOfExperience || 0,
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email"),
      name: (value) => (value.trim().length < 2 ? "Name must have at least 2 letters" : null),
      yearsOfExperience: (value) => (value < 0 ? "Years of experience cannot be negative" : null),
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    setError(null);

    try {
      let profilePictureUrl = user?.profilePicture;

      // 1. Handle profile picture upload if a new one is selected
      if (values.profilePicture) {
        const file = values.profilePicture as File;
        const uploadResponse = await fetch(
          `/api/user/profile-picture?filename=${file.name}`,
          {
            method: 'POST',
            body: file,
          }
        );

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload profile picture.');
        }
        const uploadResult = await uploadResponse.json();
        profilePictureUrl = uploadResult.url;
      }

      // 2. Prepare the payload for the main profile update
      const { specialties, yearsOfExperience, profilePicture, ...userData } = values;
      const payload: Record<string, unknown> = { 
        ...userData,
        profilePicture: profilePictureUrl, // Use the new or existing URL
      };

      if (user?.role === 'CHEF') {
          payload.chefProfile = {
              specialties,
              yearsOfExperience,
              portfolioImages: user?.chefProfile?.portfolioImages || [],
          };
      }

      // 3. Update the rest of the profile data
      const response = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile.');
      }

      mutate(); // Re-fetch user data to update the UI
      form.setFieldValue('profilePicture', null); // Clear the file input

      notifications.show({
        title: "Profile Updated",
        message: "Your account details have been saved successfully.",
        color: "green",
        icon: <IconCheck />,
      });

    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  const ChefProfileFields = () => {
    if (user?.role !== 'CHEF') return null;
    const [uploading, setUploading] = useState(false);

    const handlePortfolioUpload = async (file: File | null) => {
        if (!file) return;
        setUploading(true);
        setError(null);
        try {
            const response = await fetch(`/api/chef/portfolio?filename=${file.name}`, {
                method: 'POST',
                body: file,
            });
            if (!response.ok) throw new Error('Upload failed.');
            await mutate(); // Refresh user data to show new image
            notifications.show({
                title: 'Image Uploaded',
                message: 'Your new portfolio image has been added.',
                color: 'green',
                icon: <IconCheck />,
            });
        } catch (err) {
            if (err instanceof Error) setError(err.message);
            else setError('An unknown error occurred during upload.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <>
            <Divider my="xl" label="Chef Profile" labelPosition="center" />
            <CreatableMultiSelect
                label="Specialties"
                placeholder="Select or create specialties"
                initialData={['Italian', 'French', 'Pastry', 'Grill', 'Vegan', 'Sushi']}
                {...form.getInputProps('specialties')}
            />
            <NumberInput
                label="Years of Professional Experience"
                placeholder="Enter years of experience"
                mt="md"
                min={0}
                {...form.getInputProps('yearsOfExperience')}
            />
            <FileInput
                        label="Upload Portfolio Image"
                        placeholder="Upload an image"
                        accept="image/png,image/jpeg,image/gif,image/webp,image/svg+xml"
                        mt="md"
                        onChange={handlePortfolioUpload}
                    />
            <Group mt="sm" gap="sm">
                {user?.chefProfile?.portfolioImages?.map((url: string, index: number) => (
                    <Avatar key={index} src={url} size="xl" radius="sm" />
                ))}
            </Group>
        </>
    )
  }

  return (
    <>
        <Container fluid>
        <Title order={2} mb="xl">My Profile</Title>
        <Paper withBorder p="xl" radius="md">
            <form onSubmit={form.onSubmit(handleSubmit)}>
            <Group align="flex-start">
                <Avatar src={user?.profilePicture} size={120} radius="100%" />
                <div style={{ flex: 1 }}>
                    <FileInput
                        label="Profile Picture"
                        placeholder="Upload a new photo"
                        leftSection={<IconUpload size={16} />}
                        {...form.getInputProps('profilePicture')}
                    />
                    <Text size="xs" c="dimmed" mt={5}>Upload a new photo to change your profile picture.</Text>
                </div>
            </Group>

            <TextInput label="Name" required mt="md" {...form.getInputProps("name")} />
            <TextInput label="Email" required mt="md" readOnly {...form.getInputProps("email")} />
            <TextInput label="Phone Number" mt="md" {...form.getInputProps("phone")} />
            <Textarea label="Address" mt="md" {...form.getInputProps("address")} />
            <Textarea label="Bio" placeholder="Tell us a little about yourself" mt="md" {...form.getInputProps("bio")} />
            
            <ChefProfileFields />

            {error && (
                <Alert color="red" title="Error" icon={<IconAlertCircle />} mt="lg">
                {error}
                </Alert>
            )}

            <Group justify="space-between" mt="xl">
                <Button variant="outline" onClick={openPasswordModal}>
                    Change Password
                </Button>
                <Button type="submit" loading={loading}>
                Save Changes
                </Button>
            </Group>
            </form>
        </Paper>
        </Container>
        <ChangePasswordModal opened={passwordModalOpened} onClose={closePasswordModal} />
    </>
  );
}