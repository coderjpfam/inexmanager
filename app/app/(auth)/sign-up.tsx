import React, { useState, useEffect, useRef } from 'react';
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
import { isValidEmail, isValidName } from '@/utils/validation';
import { useDebounce } from '@/hooks/use-debounce';
import { signUpSchema } from '@/utils/validation-schemas';
import { ThemedText } from '@/components/themed-text';
import { AuthHeader } from '@/components/signin/auth-header';
import { EmailInput } from '@/components/signin/email-input';
import { PasswordInput } from '@/components/signin/password-input';
import { SubmitButton } from '@/components/signin/submit-button';
import { AuthFooter } from '@/components/signin/auth-footer';
import { AuthFormCard } from '@/components/signin/auth-form-card';
import { FullNameInput } from '@/components/signup/full-name-input';
import { SignInLink } from '@/components/signup/sign-in-link';
import { PasswordStrengthIndicator } from '@/components/signup/password-strength-indicator';

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  
  // AbortController for request cancellation
  const abortControllerRef = useRef<AbortController | null>(null);

  // Debounce email and name for validation
  const debouncedEmail = useDebounce(email, 500);
  const debouncedName = useDebounce(fullName, 500);

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
    
    // Cleanup: Cancel any pending requests on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);
  
  // Validate email format on debounced email change
  useEffect(() => {
    if (debouncedEmail && debouncedEmail.trim() !== '') {
      if (!isValidEmail(debouncedEmail)) {
        setEmailError('Please enter a valid email address');
      } else {
        setEmailError(null);
      }
    } else {
      setEmailError(null);
    }
  }, [debouncedEmail]);
  
  // Validate name format on debounced name change
  useEffect(() => {
    if (debouncedName && debouncedName.trim() !== '') {
      if (!isValidName(debouncedName)) {
        setNameError('Name must be 2-50 characters and contain only letters, spaces, hyphens, and apostrophes');
      } else {
        setNameError(null);
      }
    } else {
      setNameError(null);
    }
  }, [debouncedName]);

  // Show error toast when signup fails
  useEffect(() => {
    if (signupError) {
      showError(signupError);
      dispatch(clearSignupError());
    }
  }, [signupError]);

  const handleSubmit = async () => {
    // Validate inputs using Zod schema
    try {
      signUpSchema.parse({
        name: fullName,
        email,
        password,
        confirmPassword,
      });
    } catch (error: any) {
      if (error.errors) {
        const firstError = error.errors[0];
        showError(firstError.message);
        
        // Set field-specific errors
        if (firstError.path.includes('name')) {
          setNameError(firstError.message);
        }
        if (firstError.path.includes('email')) {
          setEmailError(firstError.message);
        }
        return;
      }
      showError('Validation failed. Please check your inputs.');
      return;
    }

    // Cancel any previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new AbortController for this request
    abortControllerRef.current = new AbortController();

    try {
      const result = await dispatch(
        signup({
          name: fullName,
          email,
          password,
          confirmPassword,
          signal: abortControllerRef.current.signal,
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
    } catch (error) {
      // Request was cancelled, ignore error
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }
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
                  <FullNameInput 
                    value={fullName} 
                    onChangeText={(text) => {
                      setFullName(text);
                      setNameError(null); // Clear error on input change
                    }}
                    error={nameError || undefined}
                  />

                  <EmailInput 
                    value={email} 
                    onChangeText={(text) => {
                      setEmail(text);
                      setEmailError(null); // Clear error on input change
                    }}
                    error={emailError || undefined}
                  />

                  <PasswordInput
                    value={password}
                    onChangeText={setPassword}
                    showPassword={showPassword}
                    onToggleVisibility={() => setShowPassword(!showPassword)}
                    placeholder="Create a password"
                  />
                  <PasswordStrengthIndicator password={password} />

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
