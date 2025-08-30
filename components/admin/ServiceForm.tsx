import React, { useEffect, useMemo } from 'react';
import { Button, Group, TextInput, Textarea, Select } from '@mantine/core';
import { useForm } from '@mantine/form';
import { PricingTierForm } from './PricingTierForm';
import { Service, ServiceOption } from '@/app/admin/services/types';

interface ServiceFormProps {
  initialService: Omit<Service, 'id'> | null;
  onSubmit: (values: Omit<Service, 'id'>) => void;
  onClose: () => void;
}

const SERVICE_TYPES_DATA = [
  { value: 'TIERED', label: 'Tiered' },
  { value: 'PER_HEAD', label: 'Per-Head' },
];

const ServiceForm: React.FC<ServiceFormProps> = React.memo(
  ({ initialService, onSubmit, onClose }) => {
    const form = useForm<Omit<Service, 'id'>>({
      initialValues: {
        name: initialService?.name || '',
        description: initialService?.description || '',
        icon: initialService?.icon || '',
        type: initialService?.type || 'TIERED',
        options: initialService?.options?.map(option => ({
          ...option,
          id: option.id || Date.now().toString(),
          price: option.price || '',
          coverage: option.coverage || '',
          meals: option.meals || '',
          team: option.team || '',
          idealFor: option.idealFor || '',
        })) || [],
        price: initialService?.price || '',
        minGuests: initialService?.minGuests || '',
      },
      validate: {
        name: (value) => (value ? null : 'Name is required'),
        type: (value) => (value ? null : 'Type is required'),
        options: (value, values) => {
          if (values.type === 'TIERED' && (!value || value.length === 0)) {
            return 'At least one pricing tier is required for tiered services.';
          }
          return null;
        },
        price: (value, values) => {
          if (values.type === 'PER_HEAD' && !value) return 'Price is required for per-head services';
          return null;
        },
        minGuests: (value, values) => {
          if (values.type === 'PER_HEAD' && !value) return 'Minimum guests is required for per-head services';
          return null;
        },
      },
    });

    // Reset form when initialService changes (e.g., when opening for new service vs. edit)
    useEffect(() => {
      form.setValues({
        name: initialService?.name || '',
        description: initialService?.description || '',
        icon: initialService?.icon || '',
        type: initialService?.type || 'TIERED',
        options: initialService?.options?.map(option => ({
          ...option,
          id: option.id || Date.now().toString(),
          price: option.price || '',
          coverage: option.coverage || '',
          meals: option.meals || '',
          team: option.team || '',
          idealFor: option.idealFor || '',
        })) || [],
        price: initialService?.price || '',
        minGuests: initialService?.minGuests || '',
      });
      form.resetDirty();
    }, [initialService]);

    const memoizedOptions = useMemo(() => form.values.options || [], [JSON.stringify(form.values.options)]);

    return (
      <form onSubmit={form.onSubmit(onSubmit)}>
        <TextInput label="Service Name" {...form.getInputProps('name')} required />
        <Textarea label="Description" {...form.getInputProps('description')} mt="md" />
        <TextInput label="Icon (Tabler Icon name)" {...form.getInputProps('icon')} mt="md" placeholder="e.g., IconChefHat" />

        <Select
          label="Service Type"
          placeholder="Select type"
          data={SERVICE_TYPES_DATA}
          {...form.getInputProps('type')}
          mt="md"
          required
        />

        {form.values.type === 'TIERED' && (
          <PricingTierForm
            options={memoizedOptions}
            onChange={(newOptions) => form.setFieldValue('options', newOptions)}
          />
        )}

        {form.values.type === 'PER_HEAD' && (
          <>
            <TextInput label="Price (e.g., ₦25,000 / person)" {...form.getInputProps('price')} mt="md" required />
            <TextInput label="Minimum Guests (e.g., Minimum 5 guests)" {...form.getInputProps('minGuests')} mt="md" required />
          </>
        )}

        <Group justify="flex-end" mt="lg">
          <Button variant="default" onClick={onClose}>Cancel</Button>
          <Button type="submit">Save Service</Button>
        </Group>
      </form>
    );
  }
);

export default ServiceForm;
