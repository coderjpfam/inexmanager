import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useAuthColors } from '@/hooks/use-auth-colors';

export default function AuthPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [rememberMe, setRememberMe] = useState(false);

  const { backgroundColor, textColor } = useAuthColors();

  const handleSubmit = () => {
    // Handle authentication logic here
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#E8F4F8' }]} edges={['top']}>
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
            {/* Logo and Title */}
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <MaterialIcons name="attach-money" size={32} color="#FFFFFF" />
              </View>
              <ThemedText type="title" style={styles.title}>
                Income & Expense Manager
              </ThemedText>
              <ThemedText style={styles.subtitle}>Take control of your finances</ThemedText>
            </View>

            {/* Auth Form Card */}
            <View style={[styles.card, { backgroundColor }]}>
              {/* Toggle Between Login/Signup */}
              <View style={styles.toggleContainer}>
                <TouchableOpacity
                  onPress={() => setIsLogin(true)}
                  style={[styles.toggleButton, isLogin && styles.toggleButtonActive]}
                >
                  <Text
                    style={[
                      styles.toggleButtonText,
                      isLogin && styles.toggleButtonTextActive,
                    ]}
                  >
                    Login
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setIsLogin(false)}
                  style={[styles.toggleButton, !isLogin && styles.toggleButtonActive]}
                >
                  <Text
                    style={[
                      styles.toggleButtonText,
                      !isLogin && styles.toggleButtonTextActive,
                    ]}
                  >
                    Sign Up
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.form}>
                {/* Email Input */}
                <View style={styles.inputContainer}>
                  <Text style={[styles.label, { color: textColor }]}>Email Address</Text>
                  <View style={styles.inputWrapper}>
                    <MaterialIcons
                      name="email"
                      size={20}
                      color="#9CA3AF"
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={[styles.input, { color: textColor }]}
                      placeholder="Enter your email"
                      placeholderTextColor="#9CA3AF"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>
                </View>

                {/* Password Input */}
                <View style={styles.inputContainer}>
                  <Text style={[styles.label, { color: textColor }]}>Password</Text>
                  <View style={styles.inputWrapper}>
                    <MaterialIcons
                      name="lock"
                      size={20}
                      color="#9CA3AF"
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={[styles.input, { color: textColor }]}
                      placeholder="Enter your password"
                      placeholderTextColor="#9CA3AF"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      style={styles.eyeIcon}
                    >
                      <MaterialIcons
                        name={showPassword ? 'visibility-off' : 'visibility'}
                        size={20}
                        color="#9CA3AF"
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Remember Me & Forgot Password */}
                {isLogin && (
                  <View style={styles.optionsRow}>
                    <TouchableOpacity
                      style={styles.checkboxContainer}
                      onPress={() => setRememberMe(!rememberMe)}
                    >
                      <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                        {rememberMe && (
                          <MaterialIcons name="check" size={16} color="#2563EB" />
                        )}
                      </View>
                      <Text style={[styles.checkboxLabel, { color: textColor }]}>
                        Remember me
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity>
                      <Text style={styles.forgotPassword}>Forgot password?</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Submit Button */}
                <TouchableOpacity
                  onPress={handleSubmit}
                  style={styles.submitButton}
                  activeOpacity={0.8}
                >
                  <Text style={styles.submitButtonText}>
                    {isLogin ? 'Login' : 'Create Account'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Social Login Divider */}
              <View style={styles.dividerContainer}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>Or continue with</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Social Login Buttons */}
              <View style={styles.socialContainer}>
                <TouchableOpacity style={styles.socialButton} activeOpacity={0.7}>
                  <MaterialIcons name="g-translate" size={20} color="#4285F4" />
                  <Text style={[styles.socialButtonText, { color: textColor }]}>Google</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialButton} activeOpacity={0.7}>
                  <MaterialIcons name="facebook" size={20} color="#1877F2" />
                  <Text style={[styles.socialButtonText, { color: textColor }]}>Facebook</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                By continuing, you agree to our{' '}
                <Text style={styles.footerLink}>Terms of Service</Text>
                {' '}and{' '}
                <Text style={styles.footerLink}>Privacy Policy</Text>
              </Text>
            </View>
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
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
  },
  card: {
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 24,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 4,
    marginBottom: 24,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
  },
  toggleButtonTextActive: {
    color: '#2563EB',
    fontWeight: '600',
  },
  form: {
    gap: 20,
  },
  inputContainer: {
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 4,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB',
  },
  checkboxLabel: {
    fontSize: 14,
    marginLeft: 8,
  },
  forgotPassword: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2563EB',
  },
  submitButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#D1D5DB',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: '#6B7280',
  },
  socialContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
  },
  socialButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  footerText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  footerLink: {
    color: '#2563EB',
    fontWeight: '500',
  },
});
