import { ActionIcon, Button, Group, TextInput, Textarea, Text } from '@mantine/core';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { useForm } from '@mantine/form';
import { useEffect } from 'react';

interface ServiceOption {
  id: string;
  price: string;
  coverage: string;
  meals: string;
  team: string;
  idealFor: string;
}

interface PricingTierFormProps {
  options: ServiceOption[];
  onChange: (options: ServiceOption[]) => void;
}

export function PricingTierForm({ options, onChange }: PricingTierFormProps) {
  const form = useForm<{ tiers: ServiceOption[] }>({
    initialValues: {
      tiers: options || [],
    },
    onValuesChange: (values) => {
      onChange(values.tiers);
    },
  });

  const addTier = () => {
    form.insertListItem('tiers', { id: Date.now().toString(), price: '', coverage: '', meals: '', team: '', idealFor: '', });
  };

  const removeTier = (index: number) => {
    form.removeListItem('tiers', index);
  };

  const tierFields = form.values.tiers.map((tier, index) => (
    <div key={tier.id} style={{ border: '1px solid #eee', padding: '10px', borderRadius: '5px', marginBottom: '10px' }}>
      <Group justify="space-between" align="center">
        <Text size="sm" fw={500}>Tier {index + 1}</Text>
        <ActionIcon color="red" variant="light" onClick={() => removeTier(index)}>
          <IconTrash size={16} />
        </ActionIcon>
      </Group>
      <TextInput
        label="Price"
        placeholder="e.g., ₦50,000 / booking"
        {...form.getInputProps(`tiers.${index}.price`)}
        mt="xs"
      />
      <TextInput
        label="Coverage"
        placeholder="e.g., 4–6 people"
        {...form.getInputProps(`tiers.${index}.coverage`)}
        mt="xs"
      />
      <TextInput
        label="Meals"
        placeholder="e.g., 3-course meal"
        {...form.getInputProps(`tiers.${index}.meals`)}
        mt="xs"
      />
      <TextInput
        label="Team"
        placeholder="e.g., 1 chef + 1 assistant"
        {...form.getInputProps(`tiers.${index}.team`)}
        mt="xs"
      />
      <Textarea
        label="Ideal For"
        placeholder="e.g., Small family gatherings"
        {...form.getInputProps(`tiers.${index}.idealFor`)}
        autosize
        minRows={2}
        mt="xs"
      />
    </div>
  ));

  return (
    <div>
      {tierFields.length > 0 ? tierFields : <Text c="dimmed" ta="center" my="md">No pricing tiers added yet.</Text>}
      <Button leftSection={<IconPlus size={16} />} onClick={addTier} fullWidth mt="md">
        Add Pricing Tier
      </Button>
    </div>
  );
}