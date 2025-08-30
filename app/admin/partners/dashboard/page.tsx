"use client";

import { Title, Paper, Table, Alert } from '@mantine/core';
import { useEffect, useState } from 'react';
import { handleApiError } from '@/utils/errorHandler';

interface Referral {
  id: number;
  type: string;
  date: string;
  referredFrom: string;
  commission: number;
  status: string;
}

export default function PartnerDashboardPage() {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReferrals = async () => {
      try {
        const response = await fetch('/api/admin/partners/dashboard');
        if (!response.ok) {
          throw new Error('Failed to fetch referral data.');
        }
        const data = await response.json();
        setReferrals(data);
      } catch (err) {
        handleApiError(err);
        setError('Could not load referral data.');
      } finally {
        setLoading(false);
      }
    };

    fetchReferrals();
  }, []);

  const rows = referrals.map((row) => (
    <Table.Tr key={row.id}>
      <Table.Td style={{ minWidth: '100px' }}>{row.id}</Table.Td>
      <Table.Td style={{ minWidth: '100px' }}>{row.type}</Table.Td>
      <Table.Td style={{ minWidth: '120px' }}>{new Date(row.date).toLocaleDateString()}</Table.Td>
      <Table.Td style={{ minWidth: '150px' }}>{row.referredFrom}</Table.Td>
      <Table.Td style={{ minWidth: '100px' }}>${row.commission.toFixed(2)}</Table.Td>
      <Table.Td style={{ minWidth: '100px' }}>{row.status}</Table.Td>
    </Table.Tr>
  ));

  return (
    <Paper shadow="md" p="xl">
      <Title order={2} mb="lg">Partner Dashboard</Title>
      
      {error && <Alert color="red" title="Error">{error}</Alert>}

      <Table striped highlightOnHover withTableBorder withColumnBorders>
        <Table.Thead>
          <Table.Tr>
            <Table.Th style={{ minWidth: '100px' }}>ID</Table.Th>
            <Table.Th style={{ minWidth: '100px' }}>Type</Table.Th>
            <Table.Th style={{ minWidth: '120px' }}>Date</Table.Th>
            <Table.Th style={{ minWidth: '150px' }}>Referred From</Table.Th>
            <Table.Th style={{ minWidth: '100px' }}>Commission</Table.Th>
            <Table.Th style={{ minWidth: '100px' }}>Status</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
            {loading ? (
                <Table.Tr><Table.Td colSpan={6}>Loading...</Table.Td></Table.Tr>
            ) : (
                rows.length > 0 ? rows : <Table.Tr><Table.Td colSpan={6}>No referrals found.</Table.Td></Table.Tr>
            )}
        </Table.Tbody>
      </Table>
    </Paper>
  );
}