import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthColors } from '@/hooks/use-auth-colors';
import { AuthHeader } from '@/components/signin/auth-header';
import { AuthFooter } from '@/components/signin/auth-footer';
import { AuthFormCard } from '@/components/signin/auth-form-card';
import { router, useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

type VerificationStatus = 'loading' | 'success' | 'error' | 'already-verified';

export default function VerifyAccountPage() {
  const [status, setStatus] = useState<VerificationStatus>('loading');
  const [message, setMessage] = useState('');

  const { containerBg, textColor, cardBg } = useAuthColors();
  const params = useLocalSearchParams();
  const token = params.token as string;

  useEffect(() => {
    if (token) {
      verifyAccount();
    } else {
      setStatus('error');
      setMessage('Verification token is missing. Please check your email link.');
    }
  }, [token]);

  const verifyAccount = async () => {
    try {
      // Replace with your actual API endpoint
      const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
      const response = await fetch(`${API_URL}/api/auth/verify-account?token=${token}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        if (data.message === 'Account is already verified') {
          setStatus('already-verified');
          setMessage('Your account is already verified. You can sign in now.');
        } else {
          setStatus('success');
          setMessage('Your account has been verified successfully!');
        }
      } else {
        setStatus('error');
        setMessage(data.message || 'Verification failed. The link may have expired.');
      }
    } catch (error) {
      console.error('Verification error:', error);
      setStatus('error');
      setMessage('An error occurred while verifying your account. Please try again.');
    }
  };

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <View style={styles.statusContainer}>
            <ActivityIndicator size="large" color="#2563EB" />
            <ThemedText style={[styles.statusText, { color: textColor }]}>
              Verifying your account...
            </ThemedText>
          </View>
        );

      case 'success':
        return (
          <View style={styles.statusContainer}>
            <View style={[styles.iconContainer, styles.successIcon]}>
              <MaterialIcons name="check-circle" size={64} color="#10B981" />
            </View>
            <ThemedText type="title" style={[styles.statusTitle, { color: textColor }]}>
          Account Verified!
            </ThemedText>
            <ThemedText style={[styles.statusMessage, { color: textColor }]}>
              {message}
            </ThemedText>
            <TouchableOpacity
              style={styles.button}
              onPress={() => router.replace('/(auth)/sign-in')}
            >
              <ThemedText style={styles.buttonText}>Go to Sign In</ThemedText>
            </TouchableOpacity>
          </View>
        );

      case 'already-verified':
        return (
          <View style={styles.statusContainer}>
            <View style={[styles.iconContainer, styles.infoIcon]}>
              <MaterialIcons name="info" size={64} color="#2563EB" />
            </View>
            <ThemedText type="title" style={[styles.statusTitle, { color: textColor }]}>
          Already Verified
            </ThemedText>
            <ThemedText style={[styles.statusMessage, { color: textColor }]}>
              {message}
            </ThemedText>
            <TouchableOpacity
              style={styles.button}
              onPress={() => router.replace('/(auth)/sign-in')}
            >
              <ThemedText style={styles.buttonText}>Go to Sign In</ThemedText>
            </TouchableOpacity>
          </View>
        );

      case 'error':
        return (
          <View style={styles.statusContainer}>
            <View style={[styles.iconContainer, styles.errorIcon]}>
              <MaterialIcons name="error" size={64} color="#EF4444" />
            </View>
            <ThemedText type="title" style={[styles.statusTitle, { color: textColor }]}>
          Verification Failed
            </ThemedText>
            <ThemedText style={[styles.statusMessage, { color: textColor }]}>
              {message}
            </ThemedText>
            <View style={styles.buttonGroup}>
              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={() => router.replace('/(auth)/sign-in')}
              >
                <ThemedText style={[styles.buttonText, styles.secondaryButtonText]}>
                  Go to Sign In
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.button}
                onPress={verifyAccount}
              >
                <ThemedText style={styles.buttonText}>Try Again</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: containerBg }]} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            <AuthHeader subtitle="Account Verification" />

            <AuthFormCard>
              {renderContent()}
            </AuthFormCard>

            <AuthFooter />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    maxWidth: 400,
    width: '100%',
    alignSelf: 'center',
  },
  statusContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  successIcon: {
    backgroundColor: '#D1FAE5',
  },
  errorIcon: {
    backgroundColor: '#FEE2E2',
  },
  infoIcon: {
    backgroundColor: '#DBEAFE',
  },
  statusTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  statusText: {
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  statusMessage: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.8,
    paddingHorizontal: 16,
  },
  button: {
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 200,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#2563EB',
    shadowOpacity: 0,
    elevation: 0,
  },
  secondaryButtonText: {
    color: '#2563EB',
  },
});
