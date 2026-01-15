/**
 * Deep Linking Utilities
 * Handles deep link parsing and navigation for email verification and password reset
 */

import { Linking } from 'react-native';
import { router } from 'expo-router';

export interface DeepLinkParams {
  path: string;
  token?: string;
  [key: string]: string | undefined;
}

/**
 * Parse deep link URL
 * Supports both custom scheme (inexmanager://) and universal links (https://)
 */
export const parseDeepLink = (url: string): DeepLinkParams | null => {
  try {
    // Remove scheme prefix if present
    let path = url;
    
    // Handle custom scheme: inexmanager://auth/verify-account?token=xxx
    if (url.startsWith('inexmanager://')) {
      path = url.replace('inexmanager://', '');
    }
    // Handle universal links: https://your-domain.com/auth/verify-account?token=xxx
    else if (url.startsWith('https://') || url.startsWith('http://')) {
      const urlObj = new URL(url);
      path = urlObj.pathname + urlObj.search;
    }

    // Parse path and query parameters
    const [pathname, search] = path.split('?');
    const params: DeepLinkParams = {
      path: pathname,
    };

    // Parse query parameters
    if (search) {
      const searchParams = new URLSearchParams(search);
      searchParams.forEach((value, key) => {
        params[key] = value;
      });
    }

    return params;
  } catch (error) {
    console.error('Error parsing deep link:', error);
    return null;
  }
};

/**
 * Handle deep link navigation
 */
export const handleDeepLink = (url: string): void => {
  const params = parseDeepLink(url);
  if (!params) return;

  const { path, token } = params;

  // Route to appropriate screen based on path
  if (path.includes('verify-account')) {
    if (token) {
      router.push(`/(auth)/verify-account?token=${token}`);
    } else {
      router.push('/(auth)/verify-account');
    }
  } else if (path.includes('reset-password')) {
    if (token) {
      router.push(`/(auth)/reset-password?token=${token}`);
    } else {
      router.push('/(auth)/reset-password');
    }
  }
};

/**
 * Initialize deep linking listener
 */
export const initializeDeepLinking = (): (() => void) => {
  // Handle initial URL (if app was opened via deep link)
  Linking.getInitialURL().then((url) => {
    if (url) {
      handleDeepLink(url);
    }
  });

  // Handle deep links while app is running
  const subscription = Linking.addEventListener('url', (event) => {
    handleDeepLink(event.url);
  });

  // Return cleanup function
  return () => {
    subscription.remove();
  };
};
