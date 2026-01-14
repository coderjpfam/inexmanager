import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthColors } from '@/hooks/use-auth-colors';
import { AuthHeader } from '@/components/signin/auth-header';
import { PasswordInput } from '@/components/signin/password-input';
import { SubmitButton } from '@/components/signin/submit-button';
import { AuthFooter } from '@/components/signin/auth-footer';
import { AuthFormCard } from '@/components/signin/auth-form-card';
import { router, useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { TouchableOpacity } from 'react-native';

export default function ResetPasswordPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const { containerBg, textColor } = useAuthColors();
  const params = useLocalSearchParams();

  const handleSubmit = () => {
    if (password !== confirmPassword) {
      console.log('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      console.log('Password must be at least 8 characters');
      return;
    }
    console.log('Reset password submitted:', {
      password,
      token: params.token, // Typically received from email link
    });
    // Handle reset password logic here
    // After successful reset, navigate to sign in
    // router.replace('/(auth)/sign-in');
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
            <AuthHeader subtitle="Create a new password" />

            <AuthFormCard>
              <View style={styles.form}>
                <ThemedText style={[styles.description, { color: textColor }]}>
                  Please enter your new password below.
                </ThemedText>

                <PasswordInput
                  value={password}
                  onChangeText={setPassword}
                  showPassword={showPassword}
                  onToggleVisibility={() => setShowPassword(!showPassword)}
                  label="New Password"
                  placeholder="Enter your new password"
                />

                <PasswordInput
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  showPassword={showConfirmPassword}
                  onToggleVisibility={() => setShowConfirmPassword(!showConfirmPassword)}
                  label="Confirm New Password"
                  placeholder="Confirm your new password"
                />

                <SubmitButton label="Reset Password" onPress={handleSubmit} />
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
