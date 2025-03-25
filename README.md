# Tez Social Platform

A comprehensive social media platform with Telegram integration capabilities, built with NestJS backend and Next.js frontend.

## Project Structure

This is a monorepo containing both frontend and backend codebases:

- `/frontend`: Next.js application for the user interface
- `/backend`: NestJS API service

## Quick Links

- [Frontend Documentation](./frontend/README.md)
- [Backend Documentation](./backend/README.md)
- [Testing Report](./frontend/TEST-REPORT.md)

## Live Deployments

- Frontend: [https://tez-social.vercel.app](https://tez-social.vercel.app)
- Backend API: [https://tez-social-production.up.railway.app](https://tez-social-production.up.railway.app)

## Features

- **User Authentication**: Secure JWT-based user authentication system
- **User Profiles**: User profile management with unified username approach
- **Responsive Design**: Mobile-first design that works on all device sizes
- **API Integration**: Well-structured API with proper error handling
- **Database Integration**: MongoDB integration with proper schema design
- **Testing**: Comprehensive test suite with Playwright

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB connection string
- npm (v7 or higher)

### Frontend Development

```bash
cd frontend
npm install
npm run dev
```

### Backend Development

```bash
cd backend
npm install
npm run start:dev
```

## Architecture

The application follows a client-server architecture:

- **Frontend**: Next.js application with React, Tailwind CSS, and Zustand for state management
- **Backend**: NestJS application with MongoDB database, JWT authentication, and RESTful API endpoints
- **Database**: MongoDB Atlas cloud database
- **Deployment**: Vercel (frontend) and Railway (backend)

## Environment Configuration

Both frontend and backend require specific environment variables:

### Frontend

```
NEXT_PUBLIC_BACKEND_URL='https://tez-social-production.up.railway.app'
```

### Backend

```
MONGODB_URI=mongodb+srv://[username]:[password]@tezsocial-cluster.hvvos.mongodb.net/tez_social?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret
JWT_EXPIRATION=1d
```

## Testing

See the [Testing Report](./frontend/TEST-REPORT.md) for a comprehensive overview of the testing performed.

## Future Development

- Telegram integration for connecting with Telegram contacts
- Direct messaging functionality
- Post creation and social feed
- Follow/unfollow user functionality
