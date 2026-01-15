import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import authReducer from './authSlice';
import { storage } from '../utils/storage';

// Redux Persist configuration
const persistConfig = {
  key: 'root',
  storage: {
    getItem: async (key: string) => {
      const value = await storage.getItem(key);
      return value ? JSON.parse(value) : undefined;
    },
    setItem: async (key: string, value: unknown) => {
      await storage.setItem(key, JSON.stringify(value));
    },
    removeItem: async (key: string) => {
      await storage.removeItem(key);
    },
  },
  // Only persist auth state (user, token, refreshToken, isAuthenticated)
  whitelist: ['auth'],
};

// Persist only the auth slice
const persistedAuthReducer = persistReducer(
  {
    ...persistConfig,
    key: 'auth',
  },
  authReducer
);

export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types for Redux Persist
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
