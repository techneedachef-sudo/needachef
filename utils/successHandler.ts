import { notifications } from "@mantine/notifications";
import { IconCheck } from "@tabler/icons-react";
import React from "react";

export const showSuccessNotification = (message: string, title: string = "Success") => {
    notifications.show({
        title,
        message,
        color: "green",
        icon: React.createElement(IconCheck),
    });
};
