# Income & Expense Manager Server v2 (NestJS)

This is the NestJS version of the Income & Expense Manager server, featuring MongoDB, comprehensive security, and robust error handling.

## Features

- ✅ **NestJS Framework** - Modern, scalable Node.js framework
- ✅ **MongoDB** - Database with Mongoose ODM
- ✅ **CORS** - Cross-Origin Resource Sharing configured
- ✅ **Helmet** - Security headers protection
- ✅ **Rate Limiting** - Throttler module for API protection
- ✅ **Input Validation** - Zod schema validation
- ✅ **Error Handling** - Comprehensive exception filters
- ✅ **Winston Logging** - File-based logging with daily rotation
- ✅ **JWT Authentication** - Access and refresh tokens
- ✅ **Email Service** - Templated email sending

## Prerequisites

- Node.js (v18 or higher)
- MongoDB instance
- Email SMTP credentials

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the `server_v2` directory with the following variables:

```env
# Server
PORT=3000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/inexmanager

# JWT
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
JWT_REFRESH_SECRET=your-super-secret-refresh-key-minimum-32-characters-long
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@inexmanager.com

# Client URL
CLIENT_URL=http://localhost:8081

# Optional
SUPPORT_EMAIL=support@inexmanager.com
COMPANY_ADDRESS=123 Finance Street, Money City, FC 12345
FACEBOOK_LINK=https://facebook.com/yourpage
TWITTER_LINK=https://twitter.com/yourpage
INSTAGRAM_LINK=https://instagram.com/yourpage

# Logging
LOG_LEVEL=info
```

## Running the Application

### Development
```bash
npm run start:dev
```

### Production Build
```bash
npm run build
npm run start:prod
```

## API Endpoints

All endpoints are prefixed with `/api/v1`

### Authentication

- `POST /api/v1/auth/signup` - Register a new user
- `POST /api/v1/auth/signin` - Sign in user
- `POST /api/v1/auth/forgot-password` - Request password reset
- `POST /api/v1/auth/reset-password?token=<token>` - Reset password
- `GET /api/v1/auth/verify-account?token=<token>` - Verify email account
- `POST /api/v1/auth/refresh-token` - Refresh access token
- `GET /api/v1/auth/verify-token` - Verify token (protected)

### API Documentation

Swagger documentation is available at `/api/docs` (development only)

## Project Structure

```
server_v2/
├── src/
│   ├── auth/                 # Authentication module
│   │   ├── dto/             # Data Transfer Objects (Zod schemas)
│   │   ├── guards/          # JWT auth guards
│   │   ├── decorators/      # Custom decorators
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   └── auth.module.ts
│   ├── schemas/             # MongoDB schemas
│   │   ├── user.schema.ts
│   │   └── token.schema.ts
│   ├── common/              # Shared modules
│   │   ├── exceptions/      # Custom exceptions
│   │   ├── filters/         # Exception filters
│   │   ├── middleware/      # Custom middleware
│   │   └── services/        # Shared services (email)
│   ├── config/              # Configuration files
│   │   ├── database.config.ts
│   │   ├── env.config.ts
│   │   └── winston.config.ts
│   ├── templates/           # Email templates
│   │   ├── verify-account.html
│   │   ├── verify-account.txt
│   │   ├── reset-password.html
│   │   └── reset-password.txt
│   ├── app.module.ts        # Root module
│   └── main.ts              # Application entry point
├── logs/                    # Winston log files (auto-generated)
├── package.json
├── tsconfig.json
└── nest-cli.json
```

## Logging

Winston is configured for file-based logging:
- `logs/application-YYYY-MM-DD.log` - All logs
- `logs/error-YYYY-MM-DD.log` - Error logs only
- `logs/exceptions-YYYY-MM-DD.log` - Unhandled exceptions
- `logs/rejections-YYYY-MM-DD.log` - Unhandled promise rejections

Logs are rotated daily and kept for 14-30 days depending on log type.

## Security Features

1. **Helmet** - Sets various HTTP headers for security
2. **CORS** - Configured for specific origins
3. **Rate Limiting** - Multiple tiers of rate limiting
4. **Input Validation** - Zod schema validation on all inputs
5. **JWT** - Secure token-based authentication
6. **Password History** - Prevents password reuse (last 5 passwords)
7. **Token Expiration** - Time-limited tokens for password reset and verification

## Error Handling

All errors are caught by the global exception filter and return consistent JSON responses:

```json
{
  "success": false,
  "message": "Error message",
  "requestId": "uuid",
  "errors": [] // For validation errors
}
```

## Rate Limiting

Rate limits are applied per endpoint:
- Signup: 5 requests/minute
- Signin: 10 requests/minute
- Forgot Password: 3 requests/5 minutes
- Reset Password: 5 requests/minute
- Verify Account: 10 requests/minute
- Refresh Token: 20 requests/minute

## Development

### Generate JWT Secrets

```bash
# Generate JWT_SECRET
openssl rand -base64 32

# Generate JWT_REFRESH_SECRET
openssl rand -base64 32
```

## License

ISC
