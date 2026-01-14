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

  const handleSubmit = () => {
    console.log('Form submitted:', { email, password, mode: 'login', rememberMe });
    // Handle authentication logic here
    // After successful login, navigate to home
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

                <SubmitButton label="Sign In" onPress={handleSubmit} />
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
