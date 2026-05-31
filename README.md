# Personal Finance Manager

Minimalist personal finance manager with multi-fund support, smart category detection, and flexible budgeting.

## Features

- **Multi-Fund Support:** Manage multiple accounts/funds with real-time balance tracking.
- **Smart Hashtags:** Auto-detect categories based on hashtags in transaction notes (e.g., `#mua_sam`, `#an_sang`).
- **Undo Support:** Quickly revert transactions within 5 seconds using toast notifications.
- **Flexible Budgeting:** Set global monthly limits with the ability to override them for specific months.
- **Improved Transfer UI:** Clear visualization of money moving between funds.

## Getting Started

### 1. Installation

Clone the repository and install dependencies:

```bash
npm install
```

### 2. Environment Setup

Create a `.env` file in the root directory and add your Neon Database URL:

```env
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
```

### 3. Database Synchronization

Push the schema to your database:

```bash
npm run db:push
```

### 4. Seeding Data (Optional)

To start with some sample data:

```bash
npm run db:seed
```

### 5. Run the Application

Development mode:

```bash
npm run dev
```

Production build:

```bash
npm run build
npm run start
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Database:** Neon (PostgreSQL)
- **ORM:** Drizzle ORM
- **UI:** Tailwind CSS, Radix UI, Sonner (Toasts)
- **Icons:** Lucide React
- **Charts:** Recharts
