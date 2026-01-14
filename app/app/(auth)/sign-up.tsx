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
import { EmailInput } from '@/components/signin/email-input';
import { PasswordInput } from '@/components/signin/password-input';
import { SubmitButton } from '@/components/signin/submit-button';
import { AuthFooter } from '@/components/signin/auth-footer';
import { AuthFormCard } from '@/components/signin/auth-form-card';
import { FullNameInput } from '@/components/signup/full-name-input';
import { SignInLink } from '@/components/signup/sign-in-link';

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');

  const { containerBg } = useAuthColors();

  const handleSubmit = () => {
    if (password !== confirmPassword) {
      console.log('Passwords do not match');
      return;
    }
    console.log('Form submitted:', {
      email,
      password,
      fullName,
      mode: 'signup',
    });
    // Handle authentication logic here
    // After successful signup, navigate to home or sign in
    // router.replace('/(tabs)');
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
            <AuthHeader subtitle="Create your account to get started" />

            <AuthFormCard>
              <View style={styles.form}>
                <FullNameInput value={fullName} onChangeText={setFullName} />

                <EmailInput value={email} onChangeText={setEmail} />

                <PasswordInput
                  value={password}
                  onChangeText={setPassword}
                  showPassword={showPassword}
                  onToggleVisibility={() => setShowPassword(!showPassword)}
                  placeholder="Create a password"
                />

                <PasswordInput
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  showPassword={showConfirmPassword}
                  onToggleVisibility={() => setShowConfirmPassword(!showConfirmPassword)}
                  label="Confirm Password"
                  placeholder="Confirm your password"
                />

                <SubmitButton label="Create Account" onPress={handleSubmit} />
              </View>

              <SignInLink />
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
});
