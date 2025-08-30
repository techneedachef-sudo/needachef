import {
  Heading,
  Text,
  Row,
  Column,
  Hr,
} from "@react-email/components";
import * as React from "react";
import { EmailTemplate } from "./EmailTemplate"; // Assuming a shared wrapper

interface OrderConfirmationEmailProps {
  orderId: string;
  orderDate: string;
  customerName: string;
  items: { name: string; quantity: number; price: number }[];
  total: number;
}

export const OrderConfirmationEmail = ({
  orderId,
  orderDate,
  customerName,
  items,
  total,
}: OrderConfirmationEmailProps) => (
  <EmailTemplate preview={`Your NeedAChef Order Confirmation #${orderId}`} title="Thanks for your order!">
    <Text>
      Hi {customerName}, we&apos;ve received your order and are getting it ready.
    </Text>
    <Hr />
    <Row>
        <Column>
            <Text><strong>Order ID:</strong> {orderId}</Text>
            <Text><strong>Order Date:</strong> {orderDate}</Text>
        </Column>
    </Row>
    <Hr />
    <Heading as="h3">Order Summary</Heading>
    {items.map((item, index) => (
        <Row key={index}>
            <Column>{item.name} (x{item.quantity})</Column>
            <Column align="right">${((item.price * item.quantity) / 100).toFixed(2)}</Column>
        </Row>
    ))}
    <Hr />
    <Row>
        <Column><strong>Total</strong></Column>
        <Column align="right"><strong>${(total / 100).toFixed(2)}</strong></Column>
    </Row>
  </EmailTemplate>
);

export default OrderConfirmationEmail;
