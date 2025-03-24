# Tez Social

Tez Social is a CRM system with Telegram integration, helping users manage their Telegram contacts and conversations efficiently.

## Project Overview

This project consists of two main parts:
1. A NestJS backend API
2. A Next.js frontend application

## Key Features

- Telegram integration using Telegram's official API
- User authentication and authorization
- Contact management
- Conversation tracking
- Dashboard with analytics
- Responsive UI

## Repository Structure

```
tez-social/
├── backend/         # NestJS backend API
├── frontend/        # Next.js frontend application
├── docs/            # Documentation
├── README.md        # Main README file
└── .gitignore       # Git ignore file
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MongoDB
- Telegram API credentials

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file with the following variables:
```
PORT=3001
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRATION=24h
```

4. Start the development server:
```bash
npm run start:dev
```

The API will be available at http://localhost:3001/api.

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file with the following variables:
```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at http://localhost:3000.

## API Documentation

The API documentation is automatically generated using Swagger and is available at http://localhost:3001/api/docs when the backend is running.

## Deployment

- The backend is deployed on Railway
- The frontend is deployed on Vercel

For detailed deployment instructions, see:
- [Backend Deployment Guide](/backend/DEPLOYMENT.md)
- [Frontend Deployment Guide](/frontend/DEPLOYMENT.md)

## Contributing

Please read [CONTRIBUTING.md](/frontend/CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](/LICENSE) file for details.

## Acknowledgments

- [Telegram API](https://core.telegram.org/api)
- [NestJS](https://nestjs.com/)
- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
