import React from 'react';
import { Table, Group, ActionIcon, Text, Badge } from '@mantine/core';
import { IconPencil, IconTrash } from '@tabler/icons-react';

import { Service, ServiceOption } from "@/app/admin/services/types";

interface ServiceRowProps {
  service: Service;
  onEdit: (service: Service) => void;
  onDelete: (id: string) => void;
}

const ServiceRow: React.FC<ServiceRowProps> = React.memo(
  ({ service, onEdit, onDelete }) => (
    <Table.Tr key={service.id}>
      <Table.Td style={{ minWidth: '150px' }}>{service.name}</Table.Td>
      <Table.Td style={{ minWidth: '100px' }}>{service.type}</Table.Td>
      <Table.Td style={{ minWidth: '250px' }}>{service.description}</Table.Td>
      <Table.Td style={{ minWidth: '100px' }}>{service.icon}</Table.Td>
      <Table.Td style={{ minWidth: '150px' }}>{service.type === 'PER_HEAD' ? service.price : 'N/A'}</Table.Td>
      <Table.Td style={{ minWidth: '150px' }}>{service.type === 'PER_HEAD' ? service.minGuests : 'N/A'}</Table.Td>
      <Table.Td style={{ minWidth: '150px' }}>
        <Group gap="xs">
          <ActionIcon variant="subtle" onClick={() => onEdit(service)}>
            <IconPencil size={16} />
          </ActionIcon>
          <ActionIcon variant="subtle" color="red" onClick={() => onDelete(service.id)}>
            <IconTrash size={16} />
          </ActionIcon>
        </Group>
      </Table.Td>
    </Table.Tr>
  )
);

export default ServiceRow;
