// C:/Users/hp/needachef/app/partner/referrals/page.tsx
"use client";

import {
  Title,
  Paper,
  Text,
  Table,
  Alert,
  Container,
  Loader,
} from '@mantine/core';
import useSWR from 'swr';
import { handleApiError } from '@/utils/errorHandler';

// --- INTERFACES ---
interface Referral {
  id: string;
  type: 'Booking' | 'Inquiry';
  date: string;
  referredFrom: string;
  clientName: string;
  clientEmail: string;
  commission: number;
  status: string; // Can be more specific based on BookingStatus/InquiryStatus
  details: string;
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
const fetcher = async (url: string): Promise<Referral[]> => {
  const res = await fetch(url);
  if (!res.ok) {
    const info = await res.json();
    throw new FetchError('Failed to fetch referral data.', info, res.status);
  }
  return res.json();
};

// --- COMPONENT ---
export default function ReferralsPage() {
  const { data: referrals, error, isLoading } = useSWR('/api/partner/referrals', fetcher);

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
        Could not load your referral history. Please try again later.
      </Alert>
    );
  }

  const rows = referrals?.map((row) => (
    <Table.Tr key={row.id}>
      <Table.Td style={{ minWidth: '100px' }}>{row.id}</Table.Td>
      <Table.Td style={{ minWidth: '100px' }}>{row.type}</Table.Td>
      <Table.Td style={{ minWidth: '120px' }}>{new Date(row.date).toLocaleDateString()}</Table.Td>
      <Table.Td style={{ minWidth: '150px' }}>{row.referredFrom}</Table.Td>
      <Table.Td style={{ minWidth: '150px' }}>{row.clientName}</Table.Td>
      <Table.Td style={{ minWidth: '150px' }}>{row.clientEmail}</Table.Td>
      <Table.Td style={{ minWidth: '100px' }}>${row.commission.toFixed(2)}</Table.Td>
      <Table.Td style={{ minWidth: '100px' }}>{row.status}</Table.Td>
      <Table.Td style={{ minWidth: '200px' }}>{row.details}</Table.Td>
    </Table.Tr>
  )) || [];

  return (
    <Container fluid>
      <Title order={2} mb="lg">
        My Referrals
      </Title>
      <Paper withBorder shadow="sm" p="md" radius="md">
        <Table.ScrollContainer minWidth={800}>
          <Table striped highlightOnHover withTableBorder verticalSpacing="sm">
            <Table.Thead>
              <Table.Tr>
                <Table.Th style={{ minWidth: '100px' }}>ID</Table.Th>
                <Table.Th style={{ minWidth: '100px' }}>Type</Table.Th>
                <Table.Th style={{ minWidth: '120px' }}>Date</Table.Th>
                <Table.Th style={{ minWidth: '150px' }}>Referred From</Table.Th>
                <Table.Th style={{ minWidth: '150px' }}>Client Name</Table.Th>
                <Table.Th style={{ minWidth: '150px' }}>Client Email</Table.Th>
                <Table.Th style={{ minWidth: '100px' }}>Commission</Table.Th>
                <Table.Th style={{ minWidth: '100px' }}>Status</Table.Th>
                <Table.Th style={{ minWidth: '200px' }}>Details</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {rows.length > 0 ? (
                rows
              ) : (
                <Table.Tr>
                  <Table.Td colSpan={9}>
                    <Text ta="center">No referral history found.</Text>
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
