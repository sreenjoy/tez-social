<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

# Tez Social Backend

A powerful NestJS backend API for the Tez Social platform, featuring user authentication, profile management, and Telegram integration capabilities.

## Environment Setup

The backend requires the following environment variables:

```
# Server Configuration
PORT=3001
NODE_ENV=production

# MongoDB Connection
MONGODB_URI=mongodb+srv://[username]:[password]@tezsocial-cluster.hvvos.mongodb.net/tez_social?retryWrites=true&w=majority&appName=tezsocial-cluster

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRATION=1d

# Frontend URL (for redirects)
FRONTEND_URL=https://tez-social.vercel.app

# Telegram MTProto Configuration (for Telegram integration)
TELEGRAM_API_ID=your_telegram_api_id
TELEGRAM_API_HASH=your_telegram_api_hash
```

## API Endpoints

### Authentication

- `POST /api/auth/register`: Register a new user
- `POST /api/auth/login`: Authenticate and receive a JWT token
- `POST /api/auth/logout`: Invalidate the current token
- `GET /api/auth/me`: Get the current authenticated user
- `POST /api/auth/refresh-token`: Refresh an expired JWT token

### Users

- `GET /api/users/:id`: Get user profile
- `PATCH /api/users/:id`: Update user profile
- `GET /api/users/:id/followers`: Get user followers
- `GET /api/users/:id/following`: Get users being followed

### Telegram Integration (in development)

- `GET /api/telegram/status`: Check Telegram connection status
- `POST /api/telegram/connect`: Connect Telegram account
- `POST /api/telegram/verify`: Verify Telegram connection code
- `GET /api/telegram/contacts`: Get Telegram contacts

## Database Schema

### User

```typescript
{
  email: string;       // Required, unique
  password?: string;   // Optional (for external auth)
  username: string;    // Required
  role: string;        // Default: 'user'
  picture?: string;    // Optional profile picture URL
}
```

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run start:dev

# Build for production
npm run build

# Run in production mode
npm run start:prod
```

## Deployment

The backend is deployed on Railway at [https://tez-social-production.up.railway.app](https://tez-social-production.up.railway.app), with automatic deployments from the main branch.

## Testing

```bash
# Run tests
npm run test

# Run API tests
npm run test:e2e
```

## Important Notes

- The application uses MongoDB Atlas for data storage
- User passwords are hashed using bcrypt
- Authentication is managed through JWT tokens
- All endpoints are secured with appropriate authentication middleware
- API endpoints are prefixed with `/api`

## Deployment Instructions

### Railway Manual Deployment (Recommended)

If you're experiencing issues with CLI deployment, follow these steps for manual deployment via the Railway web console:

1. Push your code to a GitHub repository
2. Go to [Railway Dashboard](https://railway.app/dashboard)
3. Click "New Project" and select "Deploy from GitHub repo"
4. Connect your GitHub account if not already connected
5. Select the repository containing this backend code
6. Configure the following environment variables:
   - `PORT`: 3001
   - `MONGODB_URI`: mongodb+srv://sreenjoymallick14:<password>@tezsocial-cluster.hvvos.mongodb.net/?retryWrites=true&w=majority&appName=tezsocial-cluster
   - `JWT_SECRET`: 06b80f59edf19fd301b7c23bf796389754194ff701accd87c12af179c5c27a89
   - `JWT_EXPIRATION`: 24h
   - `NODE_ENV`: production
7. Deploy the project

### Local Development

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file with the required variables (see `.env.example`)

3. Start the development server:
```bash
npm run start:dev
```

4. The API will be available at http://localhost:3001/api

## Tech Stack

- NestJS
- MongoDB with Mongoose
- JWT Authentication
- TypeScript

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
