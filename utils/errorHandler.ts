import { notifications } from "@mantine/notifications";
import { IconX } from "@tabler/icons-react";
import React from "react";

/**
 * Handles errors from API calls and displays a user-friendly notification.
 * It intelligently extracts the error message from different possible error structures.
 * @param error - The error object caught from a try/catch block.
 * @param customMessage - A fallback message if the error object contains no specific message.
 */
export const handleApiError = (error: any, customMessage?: string) => {
  console.error("API Error:", error);

  // Attempt to get the specific error message from the error object.
  // This handles errors from `fetch` responses where we throw new Error(data.error)
  // as well as other error types.
  const message =
    error?.info?.error || // For SWR fetcher errors
    error?.message ||     // For standard Error objects
    customMessage ||       // Fallback to a custom message if provided
    "Something went wrong. Please try again."; // Generic fallback

  notifications.show({
    title: "An Error Occurred",
    message,
    color: "red",
    icon: React.createElement(IconX),
  });
};
