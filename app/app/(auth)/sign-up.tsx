import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuthColors } from '@/hooks/use-auth-colors';
import { useAppDispatch, useAppSelector } from '@/hooks/use-redux';
import { signup, clearSignupError } from '@/store/authSlice';
import { useToast } from '@/hooks/use-toast';
import { ThemedText } from '@/components/themed-text';
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

  const { containerBg, textColor } = useAuthColors();
  const dispatch = useAppDispatch();
  const { signupLoading, signupError } = useAppSelector(
    (state) => state.auth
  );
  const { showError, showSuccess } = useToast();
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [signupEmail, setSignupEmail] = useState('');

  // Clear error when component mounts
  useEffect(() => {
    dispatch(clearSignupError());
  }, []);

  // Show error toast when signup fails
  useEffect(() => {
    if (signupError) {
      showError(signupError);
      dispatch(clearSignupError());
    }
  }, [signupError]);

  const handleSubmit = async () => {
    if (!fullName || !email || !password || !confirmPassword) {
      showError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      showError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      showError('Password must be at least 6 characters long');
      return;
    }

    const result = await dispatch(
      signup({
        name: fullName,
        email,
        password,
        confirmPassword,
      })
    );

    if (signup.fulfilled.match(result)) {
      // Signup successful - show verification message
      setSignupEmail(email);
      setSignupSuccess(true);
      showSuccess(
        'Account created successfully!',
        'Please check your email to verify your account'
      );
      
      // Clear form
      setFullName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
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
            <AuthHeader subtitle="Create your account to get started" />

            {signupSuccess ? (
              <AuthFormCard>
                <View style={styles.successContainer}>
                  <ThemedText type="title" style={[styles.successTitle, { color: textColor }]}>
                    Check Your Email
                  </ThemedText>
                  <ThemedText style={[styles.successMessage, { color: textColor }]}>
                    We've sent a verification link to{'\n'}
                    <ThemedText style={styles.emailText}>{signupEmail}</ThemedText>
                  </ThemedText>
                  <ThemedText style={[styles.successInstructions, { color: textColor }]}>
                    Please click the link in the email to verify your account before signing in.
                  </ThemedText>
                  <View style={styles.buttonContainer}>
                    <TouchableOpacity
                      style={styles.button}
                      onPress={() => {
                        setSignupSuccess(false);
                        setSignupEmail('');
                        router.push('/(auth)/sign-in');
                      }}
                    >
                      <ThemedText style={styles.buttonText}>Go to Sign In</ThemedText>
                    </TouchableOpacity>
                  </View>
                </View>
              </AuthFormCard>
            ) : (
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

                  <SubmitButton
                    label="Create Account"
                    onPress={handleSubmit}
                    loading={signupLoading}
                  />
                </View>

                <SignInLink />
              </AuthFormCard>
            )}

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
  successContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 24,
  },
  emailText: {
    fontWeight: '600',
    color: '#2563EB',
  },
  successInstructions: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.7,
    lineHeight: 20,
  },
  buttonContainer: {
    width: '100%',
    marginTop: 8,
  },
  button: {
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
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
});
