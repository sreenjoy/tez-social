# Tez Social Frontend

A modern social platform frontend built with Next.js, connecting to the Tez Social backend API.

## Environment Setup

The frontend is configured to communicate with the production backend API. Key environment variables:

```
NEXT_PUBLIC_BACKEND_URL='https://tez-social-production.up.railway.app'
```

## Authentication Flow

The application implements a JWT-based authentication system:

1. User logs in with email/password
2. Backend validates credentials and returns a JWT token
3. Token is stored in localStorage
4. Token is included in all subsequent API requests
5. Protected routes check for valid token before rendering

## Key Features

- **User Authentication**: Login, register, logout functionality
- **User Profile**: View and edit user profile information
- **Responsive Design**: Optimized for desktop and mobile devices
- **Protected Routes**: Authorization-based access control

## Folder Structure

- `components/`: Reusable UI components
- `pages/`: Next.js pages and routes
- `services/`: API service handlers
- `store/`: State management using Zustand
- `tests/`: Automated tests

## API Integration

All API communication is handled through the `services/api.ts` file, which configures axios instances for various endpoints:
- `authApi`: Authentication endpoints (register, login, logout)
- `userApi`: User profile management
- `postApi`: Post creation and management (future expansion)
- `telegramApi`: Telegram integration (future expansion)

## Development & Testing

Run the development server:

```bash
npm run dev
```

Run automated tests:

```bash
npx playwright test
```

## Deployment

The frontend is deployed on Vercel at [https://tez-social.vercel.app](https://tez-social.vercel.app), with automatic deployments from the main branch.

## Important Notes

- The application uses a unified username field rather than separate first name/last name fields
- All API calls to the backend include the `/api` prefix in the URL
- Token refresh is handled automatically by the authentication store

## Testing

See [TEST-REPORT.md](./TEST-REPORT.md) for a comprehensive testing report.
