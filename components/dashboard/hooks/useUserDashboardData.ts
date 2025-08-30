"use client";

import useSWR from 'swr';
import { useEffect } from "react";
import { useAuth } from "@/components/auth/AuthProvider";

const fetcher = (url: string) => fetch(url).then(res => {
    if (!res.ok) {
        // This will be caught by the SWR error boundary
        throw new Error('Application not found');
    }
    return res.json();
});

export const useUserDashboardData = () => {
    const { user } = useAuth();
    
    // Conditionally fetch data only if the user is loaded
    const { data: application, error: applicationError, mutate: mutateApplication } = useSWR(user ? '/api/chef/application' : null, fetcher);
    const { data: bookings, error: bookingsError, mutate: mutateBookings } = useSWR(user ? '/api/bookings' : null, fetcher);
    const { data: orders, error: ordersError, mutate: mutateOrders } = useSWR(user ? '/api/orders' : null, fetcher);

    useEffect(() => {
        // Re-fetch data when user role changes
        mutateApplication();
        mutateBookings();
        mutateOrders();
    }, [user?.role, mutateApplication, mutateBookings, mutateOrders]);

    const isApprovedChef = user?.role === 'CHEF';
    const noApplicationExists = !!applicationError; // If there's an error (like a 404), it means they haven't applied
    const hasChefApplication = !!application && !applicationError && !isApprovedChef;

    const hasBookings = bookings && bookings.length > 0;
    const hasOrders = orders && orders.length > 0;

    return { hasBookings, hasOrders, hasChefApplication, isApprovedChef, noApplicationExists };
}
