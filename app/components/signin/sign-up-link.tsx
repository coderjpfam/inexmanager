import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useAuthColors } from '@/hooks/use-auth-colors';

interface SignUpLinkProps {
  questionText?: string;
  linkText?: string;
  onPress?: () => void;
}

export function SignUpLink({
  questionText = "Don't have an account?",
  linkText = 'Sign Up',
  onPress,
}: SignUpLinkProps) {
  const { textColor } = useAuthColors();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push('/(auth)/sign-up');
    }
  };

  return (
    <View style={styles.signUpLink}>
      <Text style={[styles.signUpText, { color: textColor }]}>{questionText} </Text>
      <TouchableOpacity onPress={handlePress}>
        <Text style={styles.signUpLinkText}>{linkText}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  signUpLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  signUpText: {
    fontSize: 14,
  },
  signUpLinkText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563EB',
  },
});
