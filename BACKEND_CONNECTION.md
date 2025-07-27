# Backend Connection Guide

This document explains how the NourishSA frontend connects to the Supabase backend.

## Overview

The frontend connects to a Supabase backend with Edge Functions that provide REST API endpoints for:

- Donations management
- Volunteer task management
- Matching engine
- Notifications
- Analytics

## Backend Structure

The backend is located in `foodlink-backend-main/foodlink-backend-main/` and contains:

### Supabase Edge Functions

- `donations-api/` - Handles donation CRUD operations
- `volunteer-api/` - Manages volunteer tasks and assignments
- `matching-engine/` - Optimizes routes and matches donors/recipients
- `notifications/` - Sends notifications via email/SMS/WhatsApp
- `analytics/` - Provides analytics and impact statistics

## Frontend Integration

### 1. API Service Layer (`src/lib/api.ts`)

The main API service layer provides:

- `donationsAPI` - Create, read, update, delete donations
- `volunteerAPI` - Manage volunteer tasks and assignments
- `matchingAPI` - Get optimized routes and nearby donations
- `notificationsAPI` - Send and manage notifications
- `analyticsAPI` - Get analytics and impact data

### 2. Supabase Client (`src/lib/supabase.ts`)

Handles:

- Authentication (sign up, sign in, sign out)
- Database operations
- Real-time subscriptions
- File storage

### 3. React Hooks

#### `useAuth` (`src/hooks/useAuth.tsx`)

- Manages authentication state
- Provides user and profile data
- Handles login/logout operations

#### `useDonations` (`src/hooks/useDonations.tsx`)

- Fetches and manages donations data
- Handles donation CRUD operations
- Auto-refresh capabilities

#### `useVolunteerTasks` (`src/hooks/useVolunteerTasks.tsx`)

- Manages volunteer tasks
- Handles task acceptance and updates
- Provides leaderboard and statistics

### 4. Configuration (`src/lib/config.ts`)

Centralized configuration for:

- API endpoints
- Supabase credentials
- Default settings
- Feature flags

## Usage Examples

### Creating a Donation

```typescript
import { useDonations } from "@/hooks/useDonations";

const { createDonation } = useDonations();

const handleSubmit = async (data) => {
  const { error } = await createDonation({
    title: data.title,
    food_category: data.category,
    quantity: data.quantity,
    pickup_address: data.address,
    latitude: data.lat,
    longitude: data.lng,
    // ... other fields
  });

  if (error) {
    console.error("Error creating donation:", error);
  }
};
```

### Accepting a Volunteer Task

```typescript
import { useVolunteerTasks } from "@/hooks/useVolunteerTasks";

const { acceptTask } = useVolunteerTasks();

const handleAcceptTask = async (taskId) => {
  const { error } = await acceptTask(taskId);
  if (error) {
    console.error("Error accepting task:", error);
  }
};
```

### Authentication

```typescript
import { useAuth } from "@/hooks/useAuth";

const { user, signIn, signOut } = useAuth();

const handleLogin = async (email, password) => {
  const { error } = await signIn(email, password);
  if (error) {
    console.error("Login error:", error);
  }
};
```

## API Endpoints

### Donations API

- `GET /donations-api` - List donations with filters
- `POST /donations-api` - Create new donation
- `PUT /donations-api/{id}` - Update donation
- `DELETE /donations-api/{id}` - Delete donation
- `POST /donations-api/{id}/claim` - Claim donation

### Volunteer API

- `GET /volunteer-api/tasks` - Get available tasks
- `GET /volunteer-api/my-tasks` - Get volunteer's tasks
- `POST /volunteer-api/accept-task` - Accept a task
- `PUT /volunteer-api/tasks/{id}` - Update task status
- `GET /volunteer-api/leaderboard` - Get leaderboard
- `GET /volunteer-api/stats/{id}` - Get volunteer stats

### Matching Engine

- `POST /matching-engine/optimize-routes` - Get optimized routes
- `GET /matching-engine/nearby` - Get nearby donations

### Notifications

- `POST /notifications/send` - Send notification
- `GET /notifications/{userId}` - Get user notifications
- `PUT /notifications/{id}/read` - Mark as read

### Analytics

- `GET /analytics/donations` - Get donation analytics
- `GET /analytics/volunteers` - Get volunteer analytics
- `GET /analytics/impact` - Get impact statistics

## Error Handling

The API layer includes comprehensive error handling:

```typescript
import { handleAPIResponse, APIError } from "@/lib/api";

try {
  const result = await handleAPIResponse(apiCall());
  // Handle success
} catch (error) {
  if (error instanceof APIError) {
    console.error("API Error:", error.message, error.status);
  } else {
    console.error("Unknown error:", error);
  }
}
```

## Real-time Updates

The application supports real-time updates through Supabase subscriptions:

```typescript
import { realtime } from "@/lib/supabase";

// Subscribe to donation changes
const subscription = realtime.subscribeToDonations((payload) => {
  console.log("Donation updated:", payload);
});

// Clean up subscription
subscription.unsubscribe();
```

## Environment Variables

The following environment variables are used:

```env
VITE_SUPABASE_URL=https://lrvgennjbmmbtpywloem.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

## Development

To run the application with backend integration:

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the development server:

   ```bash
   npm run dev
   ```

3. The frontend will automatically connect to the Supabase backend.

## Production Deployment

For production deployment:

1. Set up environment variables
2. Build the application:
   ```bash
   npm run build
   ```
3. Deploy to your hosting platform

The backend is already deployed on Supabase and ready to use.
