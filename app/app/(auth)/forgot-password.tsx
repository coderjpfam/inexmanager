import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuthColors } from '@/hooks/use-auth-colors';
import { useAppDispatch, useAppSelector } from '@/hooks/use-redux';
import { forgotPassword, clearForgotPasswordError } from '@/store/authSlice';
import { useToast } from '@/hooks/use-toast';
import { AuthHeader } from '@/components/signin/auth-header';
import { EmailInput } from '@/components/signin/email-input';
import { SubmitButton } from '@/components/signin/submit-button';
import { AuthFooter } from '@/components/signin/auth-footer';
import { AuthFormCard } from '@/components/signin/auth-form-card';
import { ThemedText } from '@/components/themed-text';
import { TouchableOpacity } from 'react-native';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');

  const { containerBg, textColor } = useAuthColors();
  const dispatch = useAppDispatch();
  const { forgotPasswordLoading, forgotPasswordError } = useAppSelector(
    (state) => state.auth
  );
  const { showError, showSuccess } = useToast();

  // Clear error when component mounts
  useEffect(() => {
    dispatch(clearForgotPasswordError());
  }, []);

  // Show error toast when forgot password fails
  useEffect(() => {
    if (forgotPasswordError) {
      showError(forgotPasswordError);
      dispatch(clearForgotPasswordError());
    }
  }, [forgotPasswordError]);

  const handleSubmit = async () => {
    if (!email) {
      showError('Please enter your email address');
      return;
    }

    const result = await dispatch(forgotPassword({ email }));
    if (forgotPassword.fulfilled.match(result)) {
      showSuccess('Reset link sent!', 'Please check your email for password reset instructions');
      // Optionally navigate back to sign in after a delay
      setTimeout(() => {
        router.replace('/(auth)/sign-in');
      }, 2000);
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
            <AuthHeader subtitle="Reset your password" />

            <AuthFormCard>
              <View style={styles.form}>
                <ThemedText style={[styles.description, { color: textColor }]}>
                  Enter your email address and we'll send you a link to reset your password.
                </ThemedText>

                <EmailInput value={email} onChangeText={setEmail} />

                <SubmitButton
                  label="Send Reset Link"
                  onPress={handleSubmit}
                  loading={forgotPasswordLoading}
                />
              </View>

              <View style={styles.backToSignIn}>
                <ThemedText style={[styles.backText, { color: textColor }]}>
                  Remember your password?{' '}
                </ThemedText>
                <TouchableOpacity onPress={() => router.push('/(auth)/sign-in')}>
                  <ThemedText style={styles.linkText}>Sign In</ThemedText>
                </TouchableOpacity>
              </View>
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
  form: {
    gap: 20,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 8,
    opacity: 0.8,
  },
  backToSignIn: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
    alignItems: 'center',
  },
  backText: {
    fontSize: 14,
  },
  linkText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563EB',
  },
});
