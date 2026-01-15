/**
 * Error Boundary Component
 * Catches React errors and displays a fallback UI
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { ErrorBoundary } from 'react-error-boundary';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { useAuthColors } from '@/hooks/use-auth-colors';
import { logError } from '@/utils/logger';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

/**
 * Error Fallback Component
 * Displays when an error is caught by the error boundary
 */
function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  const { containerBg, textColor, cardBg, borderColor } = useAuthColors();

  // Log the error for debugging
  React.useEffect(() => {
    logError('React Error Boundary caught an error', error);
  }, [error]);

  return (
    <ThemedView style={[styles.container, { backgroundColor: containerBg }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
          <ThemedText type="title" style={[styles.title, { color: textColor }]}>
            Oops! Something went wrong
          </ThemedText>
          
          <ThemedText style={[styles.message, { color: textColor }]}>
            We're sorry, but something unexpected happened. Please try again.
          </ThemedText>

          {__DEV__ && (
            <View style={[styles.errorDetails, { borderColor }]}>
              <ThemedText style={[styles.errorTitle, { color: textColor }]}>
                Error Details (Development Only):
              </ThemedText>
              <ThemedText style={[styles.errorText, { color: textColor }]}>
                {error.message}
              </ThemedText>
              {error.stack && (
                <ThemedText style={[styles.stackTrace, { color: textColor }]}>
                  {error.stack}
                </ThemedText>
              )}
            </View>
          )}

          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#2563EB' }]}
            onPress={resetErrorBoundary}
          >
            <ThemedText style={styles.buttonText}>Try Again</ThemedText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

interface AppErrorBoundaryProps {
  children: React.ReactNode;
}

/**
 * App Error Boundary
 * Wraps the app to catch React errors
 */
export function AppErrorBoundary({ children }: AppErrorBoundaryProps) {
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    // Log error with component stack
    logError('React Error Boundary caught an error', {
      error,
      componentStack: errorInfo.componentStack,
    });
  };

  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={handleError}
      onReset={() => {
        // Reset app state if needed
        // For example, clear Redux state, reset navigation, etc.
      }}
    >
      {children}
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 500,
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
    opacity: 0.8,
  },
  errorDetails: {
    marginTop: 16,
    marginBottom: 24,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 12,
    fontFamily: 'monospace',
    marginBottom: 8,
  },
  stackTrace: {
    fontSize: 10,
    fontFamily: 'monospace',
    opacity: 0.7,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
