import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';

interface ForgotPasswordLinkProps {
  onPress?: () => void;
}

export function ForgotPasswordLink({ onPress }: ForgotPasswordLinkProps) {
  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push('/(auth)/forgot-password');
    }
  };

  return (
    <TouchableOpacity onPress={handlePress}>
      <Text style={styles.forgotPassword}>Forgot password?</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  forgotPassword: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2563EB',
  },
});
