/**
 * AuthGuard Component
 * Verifies token on app load and handles initial routing
 */

import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { router, useSegments } from 'expo-router';
import { Image } from 'expo-image';
import { useAppDispatch, useAppSelector } from '@/hooks/use-redux';
import { loadCredentials, verifyToken } from '@/store/authSlice';
import { store } from '@/store';
import { storage } from '@/utils/storage';
import { isTokenExpired } from '@/utils/token';
import { useAuthColors } from '@/hooks/use-auth-colors';
import { ThemedText } from '@/components/themed-text';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useAppDispatch();
  const { token, isAuthenticated, verifyTokenLoading } = useAppSelector(
    (state) => state.auth
  );
  const segments = useSegments();
  const { containerBg, textColor } = useAuthColors();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      handleRouting();
    }
  }, [isLoading, isAuthenticated, segments]);

  const checkAuthStatus = async () => {
    try {
      // Load tokens from storage
      const storedToken = await storage.getToken();
      const storedRefreshToken = await storage.getRefreshToken();
      const storedUser = await storage.getUser();

      if (storedToken) {
        // Check if token is expired before making server call
        if (isTokenExpired(storedToken)) {
          // Token is expired, check if refresh token is also expired
          if (isTokenExpired(storedRefreshToken)) {
            // Both tokens expired, clear storage and redirect to sign-in
            await storage.clearAll();
            dispatch(loadCredentials({ user: null, token: null, refreshToken: null }));
            setIsLoading(false);
            return;
          }
          // Access token expired but refresh token valid - will be refreshed by API client
          // Continue to load credentials, token will be refreshed on first API call
        }

        // Load credentials into Redux
        dispatch(
          loadCredentials({
            user: storedUser,
            token: storedToken,
            refreshToken: storedRefreshToken,
          })
        );

        // Verify token with server (only if not expired)
        if (!isTokenExpired(storedToken)) {
          const result = await dispatch(verifyToken(storedToken));
          
          if (verifyToken.fulfilled.match(result)) {
            // Token is valid, user is authenticated
            // Credentials are already loaded, so isAuthenticated will be true
            // verifyToken.fulfilled handler will set isAuthenticated = true
          }
          // If verifyToken.rejected, the reducer already clears storage and state
        } else {
          // Token is expired but refresh token might be valid
          // Let the API client handle refresh on first request
          // For now, set as authenticated (will be refreshed automatically)
          const state = store.getState();
          if (state.auth.refreshToken && !isTokenExpired(state.auth.refreshToken)) {
            // Refresh token is valid, user can stay authenticated
            // Token will be refreshed automatically on next API call
          } else {
            // Both tokens expired
            await storage.clearAll();
            dispatch(loadCredentials({ user: null, token: null, refreshToken: null }));
          }
        }
      } else {
        // No token found, ensure state is cleared
        dispatch(loadCredentials({ user: null, token: null, refreshToken: null }));
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      // On error, clear storage and redirect to sign-in
      await storage.clearAll();
      dispatch(loadCredentials({ user: null, token: null, refreshToken: null }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRouting = () => {
    const inAuthGroup = segments[0] === '(auth)';

    if (isLoading || verifyTokenLoading) {
      // Still loading, don't navigate
      return;
    }

    if (!isAuthenticated && !inAuthGroup) {
      // Not authenticated and not in auth group, redirect to sign-in
      router.replace('/(auth)/sign-in');
    } else if (isAuthenticated && inAuthGroup) {
      // Authenticated but in auth group, redirect to dashboard
      router.replace('/(main)/dashboard');
    }
  };

  // Show loading screen while checking auth
  if (isLoading || verifyTokenLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: containerBg }]}>
        <View style={styles.loadingContent}>
          <View style={styles.logoContainer}>
            <Image
              source={require('@/assets/images/logo.png')}
              style={styles.logo}
              contentFit="contain"
            />
          </View>
          <ThemedText type="title" style={[styles.appTitle, { color: textColor }]}>
            Income & Expense Manager
          </ThemedText>
          <ActivityIndicator 
            size="large" 
            color="#2563EB" 
            style={styles.spinner}
          />
          <ThemedText style={[styles.loadingText, { color: textColor }]}>
            Loading...
          </ThemedText>
        </View>
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  logoContainer: {
    width: 120,
    height: 120,
    marginBottom: 24,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 100,
    height: 100,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 32,
    textAlign: 'center',
  },
  spinner: {
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    opacity: 0.7,
  },
});
