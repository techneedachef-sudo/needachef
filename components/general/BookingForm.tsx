"use client";

import { useForm } from "@mantine/form";
import {
  TextInput,
  Textarea,
  Button,
  Box,
  LoadingOverlay,
  Select,
  NumberInput,
  Group,
  MultiSelect,
  Title,
  Divider,
  Text,
  Badge,
  Stack,
  Alert,
  Loader,
  ActionIcon,
} from "@mantine/core";
import { DatePickerInput, TimeInput } from "@mantine/dates";
import { useState, useEffect, useRef } from "react";
import { handleApiError } from "@/utils/errorHandler";
import { showSuccessNotification } from "@/utils/successHandler";
import { useSearchParams } from "next/navigation";
import { CreatableMultiSelect } from "./CreatableMultiSelect";
import useSWR from "swr";
import {
  IconUsers,
  IconCurrencyNaira,
  IconBowl,
  IconUsersGroup,
  IconCalendarEvent,
  IconInfoCircle,
  IconAlertCircle,
  IconClock,
} from "@tabler/icons-react";

interface ServiceOption {
  price: string;
  coverage: string;
  meals: string;
  team: string;
  idealFor: string;
}

interface Service {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  type: 'TIERED' | 'PER_HEAD';
  options: ServiceOption[] | null; // JSON field
  price: string | null; // For per-head services
  minGuests: string | null; // For per-head services
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const cuisineData = ["Italian", "French", "Nigerian", "Asian Fusion", "Mediterranean", "Mexican"];
const kitchenEquipmentData = ["Standard Oven", "Gas Stove", "Microwave", "Blender", "Food Processor", "Air Fryer"];

const useAffiliateTracking = () => {
  const searchParams = useSearchParams();
  const [trackingData, setTrackingData] = useState({ ref: '', utm_source: '', utm_medium: '', utm_campaign: '' });

  useEffect(() => {
    setTrackingData({
      ref: searchParams.get('ref') || '',
      utm_source: searchParams.get('utm_source') || '',
      utm_medium: searchParams.get('utm_medium') || '',
      utm_campaign: searchParams.get('utm_campaign') || '',
    });
  }, [searchParams]);

  return trackingData;
};

export function BookingForm() {
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const trackingData = useAffiliateTracking();
  const ref = useRef<HTMLInputElement>(null);

  const { data: services, error, isLoading } = useSWR<Service[]>("/api/services", fetcher);

  const [selectedServiceDetails, setSelectedServiceDetails] = useState<
    | { type: "TIERED"; tier: Service; option: ServiceOption }
    | { type: "PER_HEAD"; option: Service }
    | null
  >(null);

  useEffect(() => {
    if (!services) return;

    const serviceId = searchParams.get("serviceId");
    const optionIndex = searchParams.get("optionIndex");
    const type = searchParams.get("type"); // This will be 'tiered' or 'per-head' from the URL

    if (serviceId && type) {
      if (type === "tiered" && optionIndex !== null) {
        const tier = services.find((t) => t.id === serviceId && t.type === "TIERED");
        if (tier && tier.options && tier.options[parseInt(optionIndex)]) {
          setSelectedServiceDetails({
            type: "TIERED",
            tier,
            option: tier.options[parseInt(optionIndex)],
          });
        }
      } else if (type === "per-head") {
        const option = services.find((o) => o.id === serviceId && o.type === "PER_HEAD");
        if (option) {
          setSelectedServiceDetails({ type: "PER_HEAD", option });
        }
      }
    }
  }, [searchParams, services]);

  const form = useForm<{
    serviceId: string; // Store the ID of the selected service/tier
    serviceType: "TIERED" | "PER_HEAD"; // Store the type
    serviceOptionIndex?: number; // For tiered services
    eventType: string;
    date: Date | null;
    time: string;
    location: string;
    guests: number;
    cuisinePreferences: string[];
    dietaryRestrictions: string;
    kitchenEquipment: string[];
    details: string;
  }>({
    initialValues: {
      serviceId: selectedServiceDetails?.type === "TIERED" ? selectedServiceDetails.tier.id : selectedServiceDetails?.option.id || '',
      serviceType: "TIERED", // Default to tiered if not pre-selected
      serviceOptionIndex: selectedServiceDetails?.type === "TIERED" && selectedServiceDetails.tier.options ? selectedServiceDetails.tier.options.indexOf(selectedServiceDetails.option) : undefined,
      eventType: '',
      date: null,
      time: '',
      location: '',
      guests: 1,
      cuisinePreferences: [],
      dietaryRestrictions: '',
      kitchenEquipment: [],
      details: '',
    },
    validate: {
      serviceId: (value) => (value ? null : "Please select a service"),
      eventType: (value) => (value ? null : "Please select an event type"),
      date: (value) => (value === null ? "Please select a date" : null),
      location: (value) => (value.trim().length < 3 ? "Please enter a valid location" : null),
    },
  });

  // Update form initial values when selectedServiceDetails changes
  useEffect(() => {
    if (selectedServiceDetails) {
      form.setValues({
        serviceId: selectedServiceDetails.type === "TIERED" ? selectedServiceDetails.tier.id : selectedServiceDetails.option.id,
        serviceType: selectedServiceDetails.type,
        serviceOptionIndex: selectedServiceDetails.type === "TIERED" && selectedServiceDetails.tier.options ? selectedServiceDetails.tier.options.indexOf(selectedServiceDetails.option) : undefined,
        guests: selectedServiceDetails.type === "TIERED" ? parseInt(selectedServiceDetails.option.coverage.split('–')[0] || '1') : parseInt(selectedServiceDetails.option.minGuests?.split(' ')[1] || '1'),
      });
    }
  }, [selectedServiceDetails]);

  const pickerControl = (
    <ActionIcon variant="subtle" color="gray" onClick={() => ref.current?.showPicker()}>
      <IconClock size={16} stroke={1.5} />
    </ActionIcon>
  );


  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    try {
      const response = await fetch("/api/create-booking-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, ...trackingData, selectedService: selectedServiceDetails }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Server error, please try again.");
      }

      const session = await response.json();

      const handler = (window as any).PaystackPop.setup({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!,
        email: session.email,
        amount: session.amount * 100,
        ref: session.access_code, // Use access_code to initialize the transaction
        onClose: function () {
          // Redirect to a pending page if the user closes the modal
          window.location.href = `/booking/pending?ref=${session.reference}`;
        },
        callback: function (response: any) {
          // Redirect to verification page after a transaction attempt
          window.location.href = `/booking/verify?ref=${response.reference}`;
        },
      });

      handler.openIframe();

    } catch (error) {
      handleApiError(error);
      setLoading(false); // Only stop loading if an error occurs before Paystack modal opens
    }
  };

  if (isLoading) {
    return <Loader my="xl" />;
  }

  if (error || !services) {
    return (
      <Alert color="red" title="Error loading services" icon={<IconAlertCircle />} my="xl">
        Failed to load services. Please try again later.
      </Alert>
    );
  }

  const allServicesForSelect = services.flatMap(item => {
    if (item.type === "TIERED" && item.options) {
      return item.options.map((option, index) => ({
        value: `${item.id}-${index}-tiered`,
        label: `${item.name} - ${option.price} (${option.coverage})`,
      }));
    } else if (item.type === "PER_HEAD") {
      return [{
        value: `${item.id}-per-head`,
        label: `${item.name} - ${item.price} (${item.minGuests})`,
      }];
    }
    return [];
  });

  return (
    <Box pos="relative">
      <LoadingOverlay visible={loading} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Title order={4} mb="lg">Event Details</Title>

        {selectedServiceDetails ? (
          <Stack mb="xl" p="md" style={{ border: '1px solid var(--mantine-color-gray-3)', borderRadius: 'var(--mantine-radius-md)' }}>
            <Group justify="space-between" align="center">
              <Text fw={700} size="lg">Selected Service:</Text>
              <Badge variant="filled" color="orange" size="lg">
                {selectedServiceDetails.type === "TIERED" ? selectedServiceDetails.tier.name : selectedServiceDetails.option.name}
              </Badge>
            </Group>
            <Text fz="sm" c="dimmed">
              {selectedServiceDetails.type === "TIERED" ? selectedServiceDetails.tier.description : selectedServiceDetails.option.description}
            </Text>
            <Divider my="xs" />
            {selectedServiceDetails.type === "TIERED" ? (
              <>
                <Group wrap="nowrap" align="center">
                  <IconCurrencyNaira size={18} />
                  <Text fz="sm">Price: <Text span fw={500}>{selectedServiceDetails.option.price}</Text></Text>
                </Group>
                <Group wrap="nowrap" align="center">
                  <IconUsers size={18} />
                  <Text fz="sm">Coverage: <Text span fw={500}>{selectedServiceDetails.option.coverage}</Text></Text>
                </Group>
                <Group wrap="nowrap" align="center">
                  <IconBowl size={18} />
                  <Text fz="sm">Meals: <Text span fw={500}>{selectedServiceDetails.option.meals}</Text></Text>
                </Group>
                <Group wrap="nowrap" align="center">
                  <IconUsersGroup size={18} />
                  <Text fz="sm">Team: <Text span fw={500}>{selectedServiceDetails.option.team}</Text></Text>
                </Group>
                <Group wrap="nowrap" align="center">
                  <IconCalendarEvent size={18} />
                  <Text fz="sm">Ideal For: <Text span fw={500}>{selectedServiceDetails.option.idealFor}</Text></Text>
                </Group>
              </>
            ) : (
              <>
                <Group wrap="nowrap" align="center">
                  <IconCurrencyNaira size={18} />
                  <Text fz="sm">Price: <Text span fw={500}>{selectedServiceDetails.option.price}</Text></Text>
                </Group>
                <Group wrap="nowrap" align="center">
                  <IconUsers size={18} />
                  <Text fz="sm">Minimum Guests: <Text span fw={500}>{selectedServiceDetails.option.minGuests}</Text></Text>
                </Group>
              </>
            )}
            <Button variant="subtle" color="gray" onClick={() => setSelectedServiceDetails(null)} size="xs" mt="sm">
              Change Service
            </Button>
          </Stack>
        ) : (
          <Select
            label="Service Required"
            placeholder="Select a service"
            data={allServicesForSelect}
            value={form.values.serviceId && form.values.serviceType ?
              (form.values.serviceType === "TIERED" ? `${form.values.serviceId}-${form.values.serviceOptionIndex}-tiered` : `${form.values.serviceId}-per-head`)
              : ''
            }
            onChange={(value) => {
              if (value && services) {
                const [id, indexOrType, type] = value.split('-');
                if (type === "tiered") {
                  const tier = services.find(t => t.id === id && t.type === "TIERED");
                  if (tier && tier.options) {
                    setSelectedServiceDetails({ type: "TIERED", tier, option: tier.options[parseInt(indexOrType)] });
                  }
                } else if (indexOrType === "per-head") {
                  const option = services.find(o => o.id === id && o.type === "PER_HEAD");
                  if (option) {
                    setSelectedServiceDetails({ type: "PER_HEAD", option });
                  }
                }
              } else {
                setSelectedServiceDetails(null);
              }
              form.setFieldValue('serviceId', ''); // Clear form value as it's managed by selectedServiceDetails
              form.setFieldValue('serviceType', 'TIERED'); // Reset type
              form.setFieldValue('serviceOptionIndex', undefined); // Reset index
            }}
            required
          />
        )}

        <Select
          mt="md"
          label="Event Type"
          placeholder="What kind of event is it?"
          data={["Private Dinner", "Corporate Event", "Birthday Party", "Cooking Class", "Other"]}
          {...form.getInputProps("eventType")}
          required
        />
        <Group grow mt="md">
            <DatePickerInput
              label="Date"
              placeholder="Select a date"
              minDate={new Date()}
              {...form.getInputProps("date")}
              required
            />
            <TimeInput label="Time" withAsterisk ref={ref} rightSection={pickerControl} {...form.getInputProps("time")} />
        </Group>
        <Group grow mt="md">
            <TextInput
              label="Location"
              placeholder="e.g., Ikoyi, Lagos"
              required
              {...form.getInputProps("location")}
            />
            <NumberInput label="Number of Guests" min={1} {...form.getInputProps("guests")} />
        </Group>

        <Divider my="xl" />
        <Title order={4} mb="lg">Food & Kitchen Details</Title>

        <CreatableMultiSelect
            label="Cuisine Preferences"
            placeholder="e.g., Italian, Nigerian"
            initialData={cuisineData}
            value={form.values.cuisinePreferences}
            onChange={(value) => form.setFieldValue('cuisinePreferences', value)}
        />

        <Textarea
          mt="md"
          label="Dietary Restrictions & Allergies"
          placeholder="e.g., Gluten-free, nut allergy, vegetarian"
          {...form.getInputProps("dietaryRestrictions")}
        />
        
        <MultiSelect
            mt="md"
            label="Available Kitchen Equipment"
            placeholder="Select all that apply"
            data={kitchenEquipmentData}
            {...form.getInputProps("kitchenEquipment")}
        />

        <Textarea
          mt="md"
          label="Additional Details"
          placeholder="Any other special requests or information for the chef?"
          minRows={3}
          {...form.getInputProps("details")}
        />
        <Button type="submit" mt="xl" fullWidth>
          Submit Booking Request
        </Button>
      </form>
    </Box>
  );
}
