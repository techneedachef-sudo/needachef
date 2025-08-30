"use client";

import { Modal, PasswordInput, Button, Group } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useState } from "react";
import { showSuccessNotification } from "@/utils/successHandler";
import { handleApiError } from "@/utils/errorHandler";

interface ChangePasswordModalProps {
    opened: boolean;
    onClose: () => void;
}

export function ChangePasswordModal({ opened, onClose }: ChangePasswordModalProps) {
    const [loading, setLoading] = useState(false);
    const form = useForm({
        initialValues: {
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        },
        validate: {
            newPassword: (value) => (value.length < 6 ? 'Password must be at least 6 characters' : null),
            confirmPassword: (value, values) => (value !== values.newPassword ? 'Passwords do not match' : null),
        },
    });

    const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to change password.');
      }
      
      showSuccessNotification("Your password has been changed successfully.");
      form.reset();
      onClose();
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

    return (
        <Modal opened={opened} onClose={onClose} title="Change Password">
            <form onSubmit={form.onSubmit(handleSubmit)}>
                <PasswordInput
                    label="Current Password"
                    placeholder="Your current password"
                    required
                    {...form.getInputProps('currentPassword')}
                />
                <PasswordInput
                    label="New Password"
                    placeholder="Your new password"
                    required
                    mt="md"
                    {...form.getInputProps('newPassword')}
                />
                <PasswordInput
                    label="Confirm New Password"
                    placeholder="Confirm your new password"
                    required
                    mt="md"
                    {...form.getInputProps('confirmPassword')}
                />
                <Group justify="flex-end" mt="xl">
                    <Button variant="default" onClick={onClose}>Cancel</Button>
                    <Button type="submit" loading={loading}>Update Password</Button>
                </Group>
            </form>
        </Modal>
    );
}
