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
import { signin, clearSigninError } from '@/store/authSlice';
import { useToast } from '@/hooks/use-toast';
import { storage } from '@/utils/storage';
import { AuthHeader } from '@/components/signin/auth-header';
import { EmailInput } from '@/components/signin/email-input';
import { PasswordInput } from '@/components/signin/password-input';
import { RememberMeCheckbox } from '@/components/signin/remember-me-checkbox';
import { ForgotPasswordLink } from '@/components/signin/forgot-password-link';
import { SubmitButton } from '@/components/signin/submit-button';
import { SignUpLink } from '@/components/signin/sign-up-link';
import { AuthFooter } from '@/components/signin/auth-footer';
import { AuthFormCard } from '@/components/signin/auth-form-card';
import { OptionsRow } from '@/components/signin/options-row';

export default function SignInPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const { containerBg } = useAuthColors();
  const dispatch = useAppDispatch();
  const { signinLoading, signinError, isAuthenticated } = useAppSelector(
    (state) => state.auth
  );
  const { showError, showSuccess } = useToast();

  // Load remember me preference and email on mount
  useEffect(() => {
    const loadRememberMe = async () => {
      const remembered = await storage.getRememberMe();
      if (remembered) {
        setRememberMe(true);
        const rememberedEmail = await storage.getRememberedEmail();
        if (rememberedEmail) {
          setEmail(rememberedEmail);
        }
      }
    };
    loadRememberMe();
    dispatch(clearSigninError());
  }, []);

  // Handle successful authentication
  useEffect(() => {
    if (isAuthenticated) {
      showSuccess('Login successful!', 'Welcome back');
      // Navigate to dashboard after successful login
      router.replace('/(main)/dashboard');
    }
  }, [isAuthenticated]);

  // Show error toast when signin fails
  useEffect(() => {
    if (signinError) {
      showError(signinError);
      dispatch(clearSigninError());
    }
  }, [signinError]);

  const handleSubmit = async () => {
    if (!email || !password) {
      showError('Please fill in all fields');
      return;
    }

    const result = await dispatch(signin({ email, password }));
    if (signin.fulfilled.match(result)) {
      // Save remember me preference and email
      await storage.saveRememberMe(rememberMe, rememberMe ? email : undefined);
      // Navigation handled by useEffect
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
            <AuthHeader />

            <AuthFormCard>
              <View style={styles.form}>
                <EmailInput value={email} onChangeText={setEmail} />

                <PasswordInput
                  value={password}
                  onChangeText={setPassword}
                  showPassword={showPassword}
                  onToggleVisibility={() => setShowPassword(!showPassword)}
                />

                <OptionsRow>
                  <RememberMeCheckbox
                    checked={rememberMe}
                    onToggle={() => setRememberMe(!rememberMe)}
                  />
                  <ForgotPasswordLink />
                </OptionsRow>

                <SubmitButton
                  label="Sign In"
                  onPress={handleSubmit}
                  loading={signinLoading}
                />
              </View>

              <SignUpLink />
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
