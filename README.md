# Need-A-Chef

Need-A-Chef is a comprehensive platform that connects users with professional chefs for various culinary services. It also provides an e-commerce platform for purchasing culinary products, a learning portal for cooking courses, and a partner program for referrals.

**Live Link:** [needachef.com](https://needachef.com)

**GitHub Repository:** [https://github.com/techneedachef-sudo/needachef](https://github.com/techneedachef-sudo/needachef)

![App Screenshot](public/image.png)

## Technologies Used

- **Frontend:** Next.js (React), TypeScript, Tailwind CSS, Mantine
- **Backend:** Next.js API Routes, Prisma, PostgreSQL
- **Authentication:** JWT (jose)
- **Payments:** Stripe
- **Email:** Resend
- **File Storage:** Vercel Blob
- **Testing:** Jest, React Testing Library

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

- Node.js (v20.x or later)
- pnpm
- PostgreSQL

### Installation

1.  **Clone the repo**
    ```sh
    git clone https://github.com/techneedachef-sudo/needachef.git
    ```
2.  **Install NPM packages**
    ```sh
    pnpm install
    ```
3.  **Set up environment variables**

    Create a `.env` file in the root of the project and add the following environment variables:

    ```env
    DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
    NEXTAUTH_SECRET="your-nextauth-secret"
    STRIPE_SECRET_KEY="your-stripe-secret-key"
    STRIPE_PUBLIC_KEY="your-stripe-public-key"
    RESEND_API_KEY="your-resend-api-key"
    BLOB_READ_WRITE_TOKEN="your-vercel-blob-token"
    ```

4.  **Run database migrations**
    ```sh
    pnpm prisma migrate dev
    ```
5.  **Seed the database**
    ```sh
    pnpm prisma db seed
    ```

### Running the Application

```sh
pnpm dev
```

The application will be available at `http://localhost:3000`.

## Key Features

- **Chef Booking:** Users can book chefs for various events and services.
- **E-commerce Store:** A shop to buy culinary products.
- **Learning Portal:** Users can enroll in cooking courses.
- **User Dashboard:** Users can manage their bookings, orders, and learning progress.
- **Admin Panel:** An administrative interface to manage users, chefs, bookings, orders, courses, and content.
- **Partner Program:** A referral program for partners to earn commissions.
- **Chef Application:** Chefs can apply to join the platform.

## Folder Structure

```
needachef/
├── app/                # Next.js App Router pages and API routes
│   ├── api/            # API routes
│   ├── admin/          # Admin panel pages
│   ├── dashboard/      # User dashboard pages
│   ├── partner/        # Partner panel pages
│   └── ...             # Other pages (login, signup, etc.)
├── components/         # Reusable React components
│   ├── admin/          # Components for the admin panel
│   ├── auth/           # Authentication related components
│   ├── dashboard/      # Components for the user dashboard
│   ├── emails/         # Email templates
│   └── ...             # Other general components
├── prisma/             # Prisma schema and migrations
├── public/             # Static assets
└── utils/              # Utility functions
```

## API Routes

The API routes are located in `app/api/`. They handle various functionalities such as:

- User authentication (login, signup, password reset)
- Chef applications
- Bookings and payments
- E-commerce orders
- Course management
- Admin actions

For more details, please refer to the `documentation.md` file.

## Deployment

The application is deployed on Vercel. The `main` branch is automatically deployed to the production environment.
