// C:/Users/hp/needachef/app/partner/dashboard/page.tsx
"use client";

import {
  Title,
  Paper,
  Table,
  Alert,
  Text,
  Container,
  Loader,
  Grid,
} from '@mantine/core';
import useSWR from 'swr';
import { handleApiError } from '@/utils/errorHandler';
import { StatsCard } from '@/components/partner/StatsCard';

// --- INTERFACES ---
interface Referral {
  id: string;
  type: 'Booking' | 'Inquiry';
  date: string;
  referredFrom: string;
  commission: number;
  status: 'Pending' | 'Completed' | 'Cancelled' | 'New' | 'Contacted' | 'Closed' | 'Confirmed';
}

interface StatsData {
  totalReferrals: { value: string; diff: number; period: string };
  totalCommission: { value: string; diff: number; period: string };
  conversionRate: { value: string; diff: number; period: string };
  pendingCommission: { value: string; diff: number; period: string };
}

interface DashboardData {
  referrals: Referral[];
  stats: StatsData;
}

class FetchError extends Error {
  info: any;
  status: number;

  constructor(message: string, info: any, status: number) {
    super(message);
    this.info = info;
    this.status = status;
  }
}

// --- FETCHER ---
const fetcher = async (url: string): Promise<DashboardData> => {
  const res = await fetch(url);
  if (!res.ok) {
    const info = await res.json();
    throw new FetchError('Failed to fetch dashboard data.', info, res.status);
  }
  return res.json();
};

// --- COMPONENT ---
export default function PartnerDashboardPage() {
  const { data, error, isLoading } = useSWR('/api/partner/dashboard', fetcher);

  if (isLoading) {
    return (
      <Container style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Loader />
      </Container>
    );
  }

  if (error) {
    handleApiError(error);
    return (
      <Alert color="red" title="Error" mt="lg">
        Could not load your dashboard data. Please try again later.
      </Alert>
    );
  }

  const rows = data?.referrals.map((row) => (
    <Table.Tr key={row.id}>
      <Table.Td style={{ minWidth: '100px' }}>{row.id}</Table.Td>
      <Table.Td style={{ minWidth: '100px' }}>{row.type}</Table.Td>
      <Table.Td style={{ minWidth: '120px' }}>{new Date(row.date).toLocaleDateString()}</Table.Td>
      <Table.Td style={{ minWidth: '150px' }}>{row.referredFrom}</Table.Td>
      <Table.Td style={{ minWidth: '100px' }}>${row.commission.toFixed(2)}</Table.Td>
      <Table.Td style={{ minWidth: '100px' }}>{row.status}</Table.Td>
    </Table.Tr>
  )) || [];

  return (
    <Container fluid>
      <Title order={2} mb="lg">
        Dashboard
      </Title>

      {data && (
        <Grid mb="xl">
          <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
            <StatsCard title="Total Referrals" {...data.stats.totalReferrals} />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
            <StatsCard title="Total Commission" {...data.stats.totalCommission} />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
            <StatsCard title="Conversion Rate" {...data.stats.conversionRate} />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
            <StatsCard title="Pending Commission" {...data.stats.pendingCommission} />
          </Grid.Col>
        </Grid>
      )}

      <Paper withBorder shadow="sm" p="md" radius="md">
        <Title order={4} mb="md">
          Recent Referrals
        </Title>
        <Table.ScrollContainer minWidth={500}>
          <Table striped highlightOnHover withTableBorder verticalSpacing="sm">
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
              {rows.length > 0 ? (
                rows
              ) : (
                <Table.Tr>
                  <Table.Td colSpan={6}>
                    <Text ta="center">No recent referrals found.</Text>
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      </Paper>
    </Container>
  );
}