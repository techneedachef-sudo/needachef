# Need-A-Chef Documentation

This document provides a detailed overview of the Need-A-Chef application, its architecture, and its components.

## Table of Contents

1.  [Database Schema](#database-schema)
2.  [Application Structure](#application-structure)
    -   [Pages (App Router)](#pages-app-router)
    -   [Components](#components)
    -   [API Routes](#api-routes)
3.  [Authentication Flow](#authentication-flow)
4.  [Admin Panel](#admin-panel)
5.  [Partner Program](#partner-program)
6.  [User Dashboard](#user-dashboard)

---

## 1. Database Schema

The database schema is defined in `prisma/schema.prisma`. It uses PostgreSQL as the database provider.

### Models

-   **User:** Represents a user of the application. Can have roles: `USER`, `ADMIN`, `CHEF`, `PARTNER`.
-   **ChefProfile:** Stores additional information for users with the `CHEF` role.
-   **ChefApplication:** Stores applications from users who want to become chefs.
-   **Inquiry:** Stores inquiries from potential partners.
-   **Order:** Represents an e-commerce order.
-   **Product:** Represents a product in the e-commerce store.
-   **Review:** Stores reviews for products.
-   **Course:** Represents a cooking course.
-   **Module:** A module within a course.
-   **Lesson:** A lesson within a module.
-   **UserCourseProgress:** Tracks a user's progress in a course.
-   **Booking:** Represents a booking for a chef's service.
-   **Service:** Represents a service offered by chefs.

### Enums

-   **Role:** `USER`, `ADMIN`, `CHEF`, `PARTNER`
-   **ChefApplicationStatus:** `PENDING`, `REVIEWED`, `APPROVED`, `DENIED`
-   **InquiryStatus:** `NEW`, `CONTACTED`, `CLOSED`
-   **OrderStatus:** `PENDING`, `PAID`, `SHIPPED`, `DELIVERED`
-   **BookingStatus:** `PENDING`, `CONFIRMED`, `COMPLETED`, `CANCELLED`
-   **PaymentStatus:** `PENDING`, `PAID`, `FAILED`, `REFUNDED`
-   **ServiceType:** `TIERED`, `PER_HEAD`

---

## 2. Application Structure

### Pages (App Router)

The application uses the Next.js App Router. The pages are located in the `app/` directory.

-   **`app/layout.tsx`:** The root layout of the application.
-   **`app/page.tsx`:** The homepage of the application.

#### Admin Pages (`app/admin/`)

-   **`app/admin/layout.tsx`:** Layout for the admin panel.
-   **`app/admin/dashboard/`:** The main dashboard for the admin.
-   **`app/admin/bookings/`:** Page to manage all bookings.
-   **`app/admin/chefs/`:** Page to manage chefs and chef applications.
-   **`app/admin/content/`:** Page to manage website content.
-   **`app/admin/courses/`:** Page to manage courses.
-   **`app/admin/ecommerce/`:** Page to manage the e-commerce store (products, orders).
-   **`app/admin/partners/`:** Page to manage partners and inquiries.
-   **`app/admin/services/`:** Page to manage services.
-   **`app/admin/settings/`:** Page for admin settings.
-   **`app/admin/users/`:** Page to manage users.

#### User Dashboard Pages (`app/dashboard/`)

-   **`app/dashboard/layout.tsx`:** Layout for the user dashboard.
-   **`app/dashboard/page.tsx`:** The main dashboard for the user.
-   **`app/dashboard/bookings/`:** Page for users to view their bookings.
-   **`app/dashboard/chef-application/`:** Page for users to apply to be a chef.
-   **`app/dashboard/chef-panel/`:** Panel for chefs to manage their profile and bookings.
-   **`app/dashboard/learning/`:** Page for users to access their enrolled courses.
-   **`app/dashboard/orders/`:** Page for users to view their e-commerce orders.
-   **`app/dashboard/profile/`:** Page for users to manage their profile.

#### Partner Pages (`app/partner/`)

-   **`app/partner/layout.tsx`:** Layout for the partner panel.
-   **`app/partner/dashboard/`:** The main dashboard for the partner.
-   **`app/partner/referrals/`:** Page for partners to track their referrals and earnings.
-   **`app/partner/settings/`:** Page for partners to manage their settings.

#### Other Pages

-   **`app/login/`:** The login page.
-   **`app/signup/`:** The signup page.
-   **`app/forgot-password/`:** The forgot password page.
-   **`app/reset-password/[token]/`:** The reset password page.
-   **`app/chefs/[id]/`:** The public profile page for a chef.
-   **`app/courses/[id]/`:** The page for a specific course.
-   **`app/shop/[id]/`:** The page for a specific product.
-   **`app/cart/`:** The shopping cart page.
-   **`app/booking/`:** The booking page.
-   **`app/payment-success/`:** The payment success page.

### Components

Reusable components are located in the `components/` directory.

-   **`components/admin/`:** Components used in the admin panel.
-   **`components/auth/`:** Components related to authentication (e.g., `AuthProvider`).
-   **`components/cart/`:** Components for the shopping cart (e.g., `CartContext`).
-   **`components/dashboard/`:** Components for the user dashboard.
-   **`components/emails/`:** React components for generating email templates.
-   **`components/general/`:** General-purpose components used throughout the application.
-   **`components/layout/`:** Layout components like `Header` and `Footer`.
-   **`components/learning/`:** Components for the learning portal.
-   **`components/partner/`:** Components for the partner panel.

### API Routes

API routes are located in `app/api/`.

-   **`app/api/auth/`:** Handles authentication (login, signup, logout).
-   **`app/api/admin/`:** API routes for administrative actions.
-   **`app/api/apply/`:** Handles chef applications.
-   **`app/api/booking/`:** Handles booking creation and management.
-   **`app/api/chef/`:** API routes for chef-related actions.
-   **`app/api/course/`:** API routes for course management.
-   **`app/api/order/`:** API routes for e-commerce orders.
-   **`app/api/partner/`:** API routes for the partner program.
-   **`app/api/user/`:** API routes for user management.
-   **`app/api/upload/`:** Handles file uploads.
-   **`app/api/paystack-webhook/`:** Handles webhooks from Paystack.
-   **`app/api/create-checkout-session/`:** Creates a Stripe checkout session.

---

## 3. Authentication Flow

The application uses JWT for authentication. The `jose` library is used to sign and verify tokens.

1.  **Login:** When a user logs in, a JWT is generated and stored in an `httpOnly` cookie.
2.  **Authorization:** The `middleware.ts` file checks for the presence of a valid JWT on protected routes.
3.  **Logout:** The cookie containing the JWT is cleared upon logout.

The `AuthProvider` component (`components/auth/AuthProvider.tsx`) provides authentication context to the application.

---

## 4. Admin Panel

The admin panel is a protected area for administrators to manage the application.

-   **Access:** Only users with the `ADMIN` role can access the admin panel.
-   **Features:**
    -   User management
    -   Chef and chef application management
    -   Booking and order management
    -   Course and content management
    -   Partner and inquiry management
    -   Service management

---

## 5. Partner Program

The partner program allows registered partners to refer new customers and earn a commission.

-   **Referral Links:** Partners get a unique referral link.
-   **Tracking:** The application tracks referrals and attibutes bookings to the respective partners.
-   **Dashboard:** Partners have a dedicated dashboard to view their referrals, earnings, and manage their settings.

---

## 6. User Dashboard

The user dashboard is a protected area for registered users to manage their activities on the platform.

-   **Profile Management:** Users can update their profile information.
-   **Bookings:** View and manage their chef bookings.
-   **Orders:** View their e-commerce order history.
-   **Learning:** Access their enrolled courses and track their progress.
-   **Chef Application:** Apply to become a chef on the platform.
-   **Chef Panel:** If the user is a chef, they can manage their profile, availability, and bookings.
