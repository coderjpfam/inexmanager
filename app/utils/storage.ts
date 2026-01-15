/**
 * Token Storage Utility
 * Platform-agnostic storage that uses:
 * - SecureStore for sensitive tokens (iOS/Android) - encrypted storage
 * - localStorage for Web (tokens) and non-sensitive data
 * - AsyncStorage for non-sensitive user data (iOS/Android)
 */

import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import type { User } from '@/services/api';

const TOKEN_KEY = '@auth_token';
const REFRESH_TOKEN_KEY = '@auth_refresh_token';
const USER_KEY = '@auth_user';
const REMEMBER_ME_KEY = '@remember_me';
const REMEMBERED_EMAIL_KEY = '@remembered_email';

const isWeb = Platform.OS === 'web';

/**
 * Platform-agnostic storage interface
 */
const platformStorage = {
  /**
   * Set item in storage
   */
  async setItem(key: string, value: string): Promise<void> {
    if (isWeb) {
      try {
        localStorage.setItem(key, value);
      } catch (error) {
        console.error('Error saving to localStorage:', error);
        throw error;
      }
    } else {
      try {
        await AsyncStorage.setItem(key, value);
      } catch (error) {
        console.error('Error saving to AsyncStorage:', error);
        throw error;
      }
    }
  },

  /**
   * Get item from storage
   */
  async getItem(key: string): Promise<string | null> {
    if (isWeb) {
      try {
        return localStorage.getItem(key);
      } catch (error) {
        console.error('Error reading from localStorage:', error);
        return null;
      }
    } else {
      try {
        return await AsyncStorage.getItem(key);
      } catch (error) {
        console.error('Error reading from AsyncStorage:', error);
        return null;
      }
    }
  },

  /**
   * Remove item from storage
   */
  async removeItem(key: string): Promise<void> {
    if (isWeb) {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.error('Error removing from localStorage:', error);
        throw error;
      }
    } else {
      try {
        await AsyncStorage.removeItem(key);
      } catch (error) {
        console.error('Error removing from AsyncStorage:', error);
        throw error;
      }
    }
  },

  /**
   * Remove multiple items from storage
   */
  async multiRemove(keys: string[]): Promise<void> {
    if (isWeb) {
      try {
        keys.forEach((key) => localStorage.removeItem(key));
      } catch (error) {
        console.error('Error removing multiple items from localStorage:', error);
        throw error;
      }
    } else {
      try {
        await AsyncStorage.multiRemove(keys);
      } catch (error) {
        console.error('Error removing multiple items from AsyncStorage:', error);
        throw error;
      }
    }
  },
};

export const storage = {
  /**
   * Save authentication token (uses SecureStore on native, localStorage on web)
   */
  async saveToken(token: string): Promise<void> {
    try {
      if (isWeb) {
        // Web: Use localStorage (SecureStore not available)
        localStorage.setItem(TOKEN_KEY, token);
      } else {
        // Native: Use SecureStore for encrypted storage
        await SecureStore.setItemAsync(TOKEN_KEY, token);
      }
    } catch (error) {
      console.error('Error saving token:', error);
      // Fallback to AsyncStorage if SecureStore fails
      if (!isWeb) {
        try {
          await AsyncStorage.setItem(TOKEN_KEY, token);
        } catch (fallbackError) {
          console.error('Error saving token to AsyncStorage fallback:', fallbackError);
        }
      }
    }
  },

  /**
   * Get authentication token (uses SecureStore on native, localStorage on web)
   */
  async getToken(): Promise<string | null> {
    try {
      if (isWeb) {
        return localStorage.getItem(TOKEN_KEY);
      } else {
        // Try SecureStore first
        const token = await SecureStore.getItemAsync(TOKEN_KEY);
        if (token) return token;
        
        // Fallback to AsyncStorage for migration
        return await AsyncStorage.getItem(TOKEN_KEY);
      }
    } catch (error) {
      console.error('Error getting token:', error);
      // Fallback to AsyncStorage if SecureStore fails
      if (!isWeb) {
        try {
          return await AsyncStorage.getItem(TOKEN_KEY);
        } catch (fallbackError) {
          console.error('Error getting token from AsyncStorage fallback:', fallbackError);
          return null;
        }
      }
      return null;
    }
  },

  /**
   * Save refresh token (uses SecureStore on native, localStorage on web)
   */
  async saveRefreshToken(refreshToken: string): Promise<void> {
    try {
      if (isWeb) {
        // Web: Use localStorage (SecureStore not available)
        localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      } else {
        // Native: Use SecureStore for encrypted storage
        await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
      }
    } catch (error) {
      console.error('Error saving refresh token:', error);
      // Fallback to AsyncStorage if SecureStore fails
      if (!isWeb) {
        try {
          await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
        } catch (fallbackError) {
          console.error('Error saving refresh token to AsyncStorage fallback:', fallbackError);
        }
      }
    }
  },

  /**
   * Get refresh token (uses SecureStore on native, localStorage on web)
   */
  async getRefreshToken(): Promise<string | null> {
    try {
      if (isWeb) {
        return localStorage.getItem(REFRESH_TOKEN_KEY);
      } else {
        // Try SecureStore first
        const token = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
        if (token) return token;
        
        // Fallback to AsyncStorage for migration
        return await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
      }
    } catch (error) {
      console.error('Error getting refresh token:', error);
      // Fallback to AsyncStorage if SecureStore fails
      if (!isWeb) {
        try {
          return await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
        } catch (fallbackError) {
          console.error('Error getting refresh token from AsyncStorage fallback:', fallbackError);
          return null;
        }
      }
      return null;
    }
  },

  /**
   * Save user data
   */
  async saveUser(user: User): Promise<void> {
    try {
      await platformStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Error saving user:', error);
    }
  },

  /**
   * Get user data
   */
  async getUser(): Promise<User | null> {
    try {
      const userStr = await platformStorage.getItem(USER_KEY);
      if (!userStr) return null;
      
      const parsed = JSON.parse(userStr) as User;
      return parsed;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  },

  /**
   * Save remember me preference
   */
  async saveRememberMe(rememberMe: boolean, email?: string): Promise<void> {
    try {
      if (isWeb) {
        localStorage.setItem(REMEMBER_ME_KEY, JSON.stringify(rememberMe));
        if (rememberMe && email) {
          localStorage.setItem(REMEMBERED_EMAIL_KEY, email);
        } else if (!rememberMe) {
          localStorage.removeItem(REMEMBERED_EMAIL_KEY);
        }
      } else {
        await AsyncStorage.setItem(REMEMBER_ME_KEY, JSON.stringify(rememberMe));
        if (rememberMe && email) {
          await AsyncStorage.setItem(REMEMBERED_EMAIL_KEY, email);
        } else if (!rememberMe) {
          await AsyncStorage.removeItem(REMEMBERED_EMAIL_KEY);
        }
      }
    } catch (error) {
      console.error('Error saving remember me preference:', error);
    }
  },

  /**
   * Get remember me preference
   */
  async getRememberMe(): Promise<boolean> {
    try {
      if (isWeb) {
        const value = localStorage.getItem(REMEMBER_ME_KEY);
        return value ? JSON.parse(value) : false;
      } else {
        const value = await AsyncStorage.getItem(REMEMBER_ME_KEY);
        return value ? JSON.parse(value) : false;
      }
    } catch (error) {
      console.error('Error getting remember me preference:', error);
      return false;
    }
  },

  /**
   * Get remembered email
   */
  async getRememberedEmail(): Promise<string | null> {
    try {
      if (isWeb) {
        return localStorage.getItem(REMEMBERED_EMAIL_KEY);
      } else {
        return await AsyncStorage.getItem(REMEMBERED_EMAIL_KEY);
      }
    } catch (error) {
      console.error('Error getting remembered email:', error);
      return null;
    }
  },

  /**
   * Clear all authentication data
   */
  async clearAll(): Promise<void> {
    try {
      if (isWeb) {
        // Web: Clear from localStorage
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        // Note: We keep remember me and email for convenience
        // Uncomment below if you want to clear them on logout
        // localStorage.removeItem(REMEMBER_ME_KEY);
        // localStorage.removeItem(REMEMBERED_EMAIL_KEY);
      } else {
        // Native: Clear from SecureStore and AsyncStorage
        try {
          await SecureStore.deleteItemAsync(TOKEN_KEY);
        } catch (error) {
          console.warn('Error deleting token from SecureStore:', error);
        }
        try {
          await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
        } catch (error) {
          console.warn('Error deleting refresh token from SecureStore:', error);
        }
        // Also clear from AsyncStorage (for migration/fallback)
        // Note: We keep remember me and email for convenience
        await AsyncStorage.multiRemove([TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY]);
        // Uncomment below if you want to clear them on logout
        // await AsyncStorage.multiRemove([REMEMBER_ME_KEY, REMEMBERED_EMAIL_KEY]);
      }
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  },
};
