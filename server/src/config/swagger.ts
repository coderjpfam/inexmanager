/**
 * Swagger/OpenAPI Configuration
 * API documentation setup using swagger-jsdoc and swagger-ui-express
 */

import swaggerJsdoc from 'swagger-jsdoc';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Income & Expense Manager API',
    version: '1.0.0',
    description: 'RESTful API for Income & Expense Manager application',
    contact: {
      name: 'API Support',
      email: process.env.SUPPORT_EMAIL || 'support@example.com',
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
  },
  servers: [
    {
      url: process.env.CLIENT_URL?.split(',')[0] || 'http://localhost:3000',
      description: 'Development server',
    },
    {
      url: 'https://api.example.com',
      description: 'Production server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT token obtained from signin or refresh token endpoint',
      },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false,
          },
          message: {
            type: 'string',
            example: 'Error message',
          },
        },
      },
      User: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            example: '507f1f77bcf86cd799439011',
          },
          name: {
            type: 'string',
            example: 'John Doe',
          },
          email: {
            type: 'string',
            format: 'email',
            example: 'john.doe@example.com',
          },
          profilePath: {
            type: 'string',
            example: 'https://example.com/profile.jpg',
          },
          currency: {
            type: 'string',
            enum: ['INR', 'USD', 'EUR', 'GBP'],
            example: 'INR',
          },
          isVerified: {
            type: 'boolean',
            example: true,
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            example: '2024-01-01T00:00:00.000Z',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            example: '2024-01-01T00:00:00.000Z',
          },
        },
      },
      AuthResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true,
          },
          message: {
            type: 'string',
            example: 'Operation successful',
          },
          data: {
            type: 'object',
            properties: {
              user: {
                $ref: '#/components/schemas/User',
              },
              token: {
                type: 'string',
                example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
              },
              refreshToken: {
                type: 'string',
                example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
              },
            },
          },
        },
      },
      SignupRequest: {
        type: 'object',
        required: ['name', 'email', 'password', 'confirmPassword'],
        properties: {
          name: {
            type: 'string',
            minLength: 1,
            maxLength: 100,
            example: 'John Doe',
          },
          email: {
            type: 'string',
            format: 'email',
            example: 'john.doe@example.com',
          },
          password: {
            type: 'string',
            minLength: 8,
            example: 'SecurePass123!',
            description: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character',
          },
          confirmPassword: {
            type: 'string',
            example: 'SecurePass123!',
          },
          profilePath: {
            type: 'string',
            format: 'uri',
            example: 'https://example.com/profile.jpg',
          },
        },
      },
      SigninRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: {
            type: 'string',
            format: 'email',
            example: 'john.doe@example.com',
          },
          password: {
            type: 'string',
            example: 'SecurePass123!',
          },
        },
      },
      ForgotPasswordRequest: {
        type: 'object',
        required: ['email'],
        properties: {
          email: {
            type: 'string',
            format: 'email',
            example: 'john.doe@example.com',
          },
        },
      },
      ResetPasswordRequest: {
        type: 'object',
        required: ['password', 'confirmPassword', 'token'],
        properties: {
          password: {
            type: 'string',
            minLength: 8,
            example: 'NewSecurePass123!',
          },
          confirmPassword: {
            type: 'string',
            example: 'NewSecurePass123!',
          },
          token: {
            type: 'string',
            example: 'reset-token-from-email',
          },
        },
      },
      VerifyAccountRequest: {
        type: 'object',
        required: ['token'],
        properties: {
          token: {
            type: 'string',
            example: 'verification-token-from-email',
          },
        },
      },
      RefreshTokenRequest: {
        type: 'object',
        required: ['refreshToken'],
        properties: {
          refreshToken: {
            type: 'string',
            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          },
        },
      },
    },
  },
  tags: [
    {
      name: 'Authentication',
      description: 'User authentication endpoints',
    },
    {
      name: 'Health',
      description: 'Health check endpoint',
    },
  ],
};

const options: swaggerJsdoc.Options = {
  definition: swaggerDefinition,
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'], // Path to the API files
};

export const swaggerSpec = swaggerJsdoc(options);
