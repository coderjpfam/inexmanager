# Income & Expense Manager - Server

Node.js Express + TypeScript server for the Income & Expense Manager application.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

3. Update the `.env` file with your configuration:
- MongoDB connection string
- JWT secrets
- Email configuration (SMTP)
- Client URL

4. Make sure MongoDB is running

5. Start the development server:
```bash
npm run dev
```

## API Endpoints

### Authentication Routes (`/api/auth`)

1. **POST /signup** - Create a new user account
2. **POST /signin** - Sign in with email and password
3. **POST /forgot-password** - Request password reset
4. **POST /reset-password** - Reset password with token
5. **GET /verify-account** - Verify account with token
6. **GET /verify-token** - Verify JWT token (protected)
7. **POST /refresh-token** - Refresh access token

## Environment Variables

- `PORT` - Server port (default: 3000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `JWT_REFRESH_SECRET` - Secret key for refresh tokens
- `CLIENT_URL` - Frontend application URL
- `EMAIL_HOST` - SMTP host
- `EMAIL_PORT` - SMTP port
- `EMAIL_USER` - SMTP username
- `EMAIL_PASS` - SMTP password
- `EMAIL_FROM` - From email address

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
