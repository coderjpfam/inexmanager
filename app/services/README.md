# API Services

This directory contains the API client and service files for making HTTP requests.

## Files

- **`api-client.ts`** - Core API client with automatic token injection and refresh
- **`api.ts`** - Auth-specific API endpoints using the api-client

## Usage

### Making Authenticated API Calls

The `apiRequest` function automatically:
- Injects the access token from Redux store
- Handles token expiration and refresh
- Retries failed requests after token refresh

```typescript
import { apiRequest } from '@/services/api-client';

// Example: Fetch user profile (token automatically added)
const response = await apiRequest<UserProfile>('/api/user/profile', {
  method: 'GET',
});

if (response.success) {
  console.log('User profile:', response.data);
}
```

### Making Public API Calls

For endpoints that don't require authentication:

```typescript
import { apiRequest } from '@/services/api-client';

// Skip token injection for public endpoints
const response = await apiRequest('/api/public/data', {
  method: 'GET',
  skipAuth: true,
});
```

### Making POST/PUT/DELETE Requests

```typescript
import { apiRequest } from '@/services/api-client';

// POST request with body
const response = await apiRequest('/api/transactions', {
  method: 'POST',
  body: JSON.stringify({
    amount: 100,
    description: 'Payment',
  }),
});

// PUT request
const response = await apiRequest(`/api/transactions/${id}`, {
  method: 'PUT',
  body: JSON.stringify({ description: 'Updated' }),
});

// DELETE request
const response = await apiRequest(`/api/transactions/${id}`, {
  method: 'DELETE',
});
```

## Features

### Automatic Token Injection
- Access token is automatically retrieved from Redux store
- Added as `Authorization: Bearer <token>` header
- No manual header management needed

### Automatic Token Refresh
- Detects expired tokens (401 errors)
- Automatically refreshes using refresh token
- Retries original request with new token
- Seamless user experience

### Proactive Token Refresh
- Checks token expiration before requests
- Refreshes tokens 5 minutes before expiration
- Prevents 401 errors from occurring

### Error Handling
- Network errors are caught and returned as error responses
- HTTP errors are properly formatted
- Invalid JSON responses are handled gracefully

## Response Format

All API responses follow this format:

```typescript
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}
```

## Options

The `apiRequest` function accepts standard `RequestInit` options plus:

- `skipAuth?: boolean` - Skip automatic token injection (for public endpoints)
- `skipRefresh?: boolean` - Skip automatic refresh (prevents infinite loops)

## Examples

### Creating a New Service

```typescript
// services/transactions.ts
import { apiRequest, ApiResponse } from './api-client';

export interface Transaction {
  _id: string;
  amount: number;
  description: string;
  date: string;
}

export const transactionsApi = {
  getAll: async (): Promise<ApiResponse<Transaction[]>> => {
    return apiRequest<Transaction[]>('/api/transactions');
  },

  getById: async (id: string): Promise<ApiResponse<Transaction>> => {
    return apiRequest<Transaction>(`/api/transactions/${id}`);
  },

  create: async (transaction: Omit<Transaction, '_id' | 'date'>): Promise<ApiResponse<Transaction>> => {
    return apiRequest<Transaction>('/api/transactions', {
      method: 'POST',
      body: JSON.stringify(transaction),
    });
  },

  update: async (id: string, transaction: Partial<Transaction>): Promise<ApiResponse<Transaction>> => {
    return apiRequest<Transaction>(`/api/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(transaction),
    });
  },

  delete: async (id: string): Promise<ApiResponse> => {
    return apiRequest(`/api/transactions/${id}`, {
      method: 'DELETE',
    });
  },
};
```

### Using in Components

```typescript
import { transactionsApi } from '@/services/transactions';
import { useAppDispatch } from '@/hooks/use-redux';

function TransactionsList() {
  const [transactions, setTransactions] = useState([]);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const fetchTransactions = async () => {
      const response = await transactionsApi.getAll();
      if (response.success && response.data) {
        setTransactions(response.data);
      } else {
        console.error('Failed to fetch transactions:', response.message);
      }
    };

    fetchTransactions();
  }, []);

  // ... rest of component
}
```

## Notes

- All authenticated endpoints automatically include the access token
- Token refresh happens transparently - no manual intervention needed
- If refresh token is expired, user is automatically logged out
- Network errors are returned as error responses, not thrown exceptions
