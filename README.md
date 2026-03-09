# Employee Status Manager

A full-stack employee status management system built with NestJS, React, PostgreSQL and AWS S3.

---

## Overview

The system allows teams to manage employee statuses in real time. Each employee has a name, a status (Working, OnVacation, LunchTime, BusinessTrip), and an optional profile picture stored in AWS S3.

---

## Tech Stack

### Backend

- **NestJS** — REST API server
- **TypeORM** — ORM for database interaction
- **PostgreSQL** (Neon) — Cloud-hosted relational database
- **AWS S3** — Profile picture storage
- **Swagger** — API documentation

### Frontend

- **React** + **Vite** + **TypeScript**
- **React Query** (@tanstack/react-query) — Server state management
- **Tailwind CSS** — Styling
- **Axios** — HTTP client
- **react-hot-toast** — Toast notifications

---

## Project Structure

```
employee-manager/
├── client/          # React frontend
├── server/          # NestJS backend
└── README.md
```

---

## Architecture Decisions

### S3 Server-Side Upload with Cleanup

Profile pictures are uploaded to AWS S3 via the server using Multer. The server streams the file directly to S3 and stores the resulting URL in the database. Critically, when an employee is deleted or their profile picture is replaced, the old file is also deleted from S3 — preventing orphaned files accumulating in the bucket.

### Migrations over `synchronize: true`

TypeORM's `synchronize: true` auto-modifies the database schema on every server restart, which is dangerous in production as it can drop columns and lose data. This project uses versioned migrations instead, giving full control over schema changes and a complete history of how the database evolved.

### Server-Side Upload vs Presigned URLs

Two approaches were evaluated for S3 uploads:

- **Presigned URLs** — client uploads directly to S3, bypassing the server entirely. Better for high-traffic production apps.
- **Server-side upload** — file goes through the server before reaching S3. Simpler implementation, easier to validate and control.

Server-side upload was chosen because it results in a simpler, more maintainable implementation for this use case, while still demonstrating full S3 integration.

### React Query for Server State

Instead of managing server data with `useEffect` + `useState`, React Query handles all fetching, caching, and invalidation. After every mutation (create, update, delete), the employees query is invalidated and automatically refetched, keeping the UI in sync with the server without manual state management.

### Portal-Based Modals

Modals and backdrops are rendered via React portals directly into `document.body`, bypassing the component tree. This prevents z-index conflicts and `overflow: hidden` clipping issues that commonly occur when modals are rendered inside deeply nested components.

### Known Improvements

- **Shared types** — `EmployeeStatus` enum and `Employee` interface are duplicated between client and server. In a production monorepo, a shared `packages/types` package would eliminate this duplication.
- **Pagination** — the current implementation fetches all employees at once. For larger datasets, cursor-based pagination would be appropriate.
- **Presigned URLs** — for high-traffic production use, switching to presigned URLs would offload file transfer bandwidth from the server.

---

## Getting Started

### Prerequisites

- Node.js v20+
- npm
- A [Neon](https://neon.tech) PostgreSQL database
- An AWS account with an S3 bucket

### 1. Clone the repository

```bash
git clone https://github.com/hadar4476/employee-manager.git
cd employee-manager
```

### 2. Set up the server

```bash
cd server
npm install
```

Create a `.env` file in `server/` based on `.env.example`:

```
DATABASE_URL=your_neon_connection_string
PORT=3000
AWS_REGION=your_aws_region
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
AWS_S3_BUCKET_NAME=your_bucket_name
```

Run database migrations:

```bash
npm run migration:run
```

Start the server:

```bash
npm run start:dev
```

### 3. Set up the client

```bash
cd ../client
npm install
```

Create a `.env` file in `client/` based on `.env.example`:

```
VITE_API_URL=http://localhost:3000
```

Start the client:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## Environment Variables

### Server (`server/.env`)

| Variable                | Description                         |
| ----------------------- | ----------------------------------- |
| `DATABASE_URL`          | Neon PostgreSQL connection string   |
| `PORT`                  | Server port (default: 3000)         |
| `AWS_REGION`            | AWS region (e.g. `eu-central-1`)    |
| `AWS_ACCESS_KEY_ID`     | AWS IAM user access key             |
| `AWS_SECRET_ACCESS_KEY` | AWS IAM user secret key             |
| `AWS_S3_BUCKET_NAME`    | S3 bucket name for profile pictures |

### Client (`client/.env`)

| Variable       | Description                                    |
| -------------- | ---------------------------------------------- |
| `VITE_API_URL` | Backend API URL (e.g. `http://localhost:3000`) |

---

## API Documentation

Swagger documentation is available at:

```
http://localhost:3000/api
```

### Endpoints

| Method | Endpoint                         | Description            |
| ------ | -------------------------------- | ---------------------- |
| GET    | `/employees`                     | Get all employees      |
| POST   | `/employees`                     | Create a new employee  |
| PATCH  | `/employees/:id/status`          | Update employee status |
| PATCH  | `/employees/:id/profile-picture` | Upload profile picture |
| DELETE | `/employees/:id`                 | Delete an employee     |

---

## Running Tests

### Unit Tests

```bash
cd server
npm run test
```

### E2E Tests

```bash
cd server
npm run test:e2e
```

### Test Coverage

```bash
cd server
npm run test:cov
```

---

## S3 Bucket Setup

1. Create an S3 bucket in your preferred AWS region
2. Disable "Block all public access"
3. Add the following bucket policy (replace `YOUR_BUCKET_NAME`):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::YOUR_BUCKET_NAME/*"
    }
  ]
}
```

### Why IAM user credentials instead of root credentials?

AWS root credentials have unrestricted access to your entire account. If they leak, an attacker controls everything. An IAM user follows the **principle of least privilege** — it only has `AmazonS3FullAccess`, so even if credentials are compromised, the blast radius is limited to S3 only.

In production you would restrict this further to specific bucket actions (`PutObject`, `GetObject`, `DeleteObject`) and consider using IAM roles instead of long-lived access keys.

4. Create an IAM user with `AmazonS3FullAccess` and generate access keys
5. Add the credentials to `server/.env`
