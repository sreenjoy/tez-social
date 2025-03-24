# Tez Social Frontend

This is the frontend application for Tez Social, a platform for managing Telegram contacts and communications.

## Setup Instructions

1. Ensure you have Node.js installed (v14 or later)
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) to view the application

## Features

- Authentication system (login & registration)
- Dashboard for managing Telegram connections
- Contact management
- Messaging interface

## Project Structure

- `src/pages`: Page components
- `src/components`: Reusable UI components
- `src/hooks`: Custom React hooks
- `src/store`: State management with Zustand
- `src/styles`: Global styles and Tailwind configuration
- `src/types`: TypeScript type definitions

## API Configuration

By default, API requests are proxied to `http://localhost:3001/api`. You can modify this in `next.config.js`.

## Building for Production

```bash
npm run build
npm run start
```

## Deployment

This project can be easily deployed on Vercel:

1. Push your code to a GitHub repository
2. Import the repository in Vercel
3. Deploy

## License

MIT 