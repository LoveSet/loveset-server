# LoveSet Server

LoveSet Server is the backend API for the LoveSet app, a recommendation engine for movies, TV shows, anime, and more. It provides user authentication, personalized recommendations, billing, watchlist management, and more.

## Features

- User authentication (Google OAuth, JWT)
- Personalized content recommendations
- Swiping mechanism (like/pass)
- Watchlist management
- Billing and subscription management (Paddle integration)
- Email notifications (welcome, referral, subscription expired)
- Rate limiting and security middleware
- Admin dashboard for background jobs (Bull Board)
- Cron jobs for subscription and swipe resets

## Tech Stack

- Node.js
- Express.js
- MongoDB (Mongoose)
- Redis (BullMQ)
- Paddle (billing)
- OpenAI API (recommendations)
- Mailjet (emails)
- Docker (optional for deployment)

## Prerequisites

- Node.js (v16+ recommended)
- MongoDB instance
- Redis instance
- Paddle account (for billing)
- Mailjet account (for emails)
- OpenAI API key

## Getting Started

### 1. Clone the repository

```sh
git clone https://github.com/LoveSet/loveset-server.git
cd loveset-server
```

### 2. Install dependencies

```sh
npm install
```

### 3. Configure environment variables

Copy `.env.example` to `.env` and fill in the required values:

```sh
cp .env.example .env
```

Edit `.env` with your credentials (MongoDB, Redis, Paddle, Mailjet, OpenAI, etc).

### 4. Run the development server

```sh
npm start
```

The server will start on the port specified in your `.env` (default: 9000).

### 5. API Endpoints

All endpoints are prefixed with `/v1`.  
See [src/routes/v1](src/routes/v1/index.js) for available routes:

- `/v1/auth` - Authentication
- `/v1/user` - User profile and onboarding
- `/v1/discover` - Content recommendations and swiping
- `/v1/content` - Content details and streaming availability
- `/v1/watchlist` - Watchlist management
- `/v1/billing` - Billing and subscriptions

### 6. Background Jobs

BullMQ is used for background processing (TMDB, webhooks).  
Access the Bull Board dashboard at:  
`http://localhost:9000/bull-board` (credentials in `.env`)

### 7. Testing

> No tests are currently specified.  
> You can add tests and run them with:

```sh
npm test
```

## Project Structure

```
src/
  app.js
  index.js
  config/
  controllers/
  models/
  routes/
  services/
  utils/
  ...
files/           # Uploaded files (e.g., images)
logs/            # Log files
```

## Deployment

- Set `NODE_ENV=production` in your environment.
- Make sure MongoDB and Redis are accessible.
- Use a process manager like PM2 or Docker for production.

## License

[ISC](LICENSE)

---

**LoveSet Server**  
Find your perfect movie match!
