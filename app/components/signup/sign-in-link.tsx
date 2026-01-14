import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useAuthColors } from '@/hooks/use-auth-colors';

interface SignInLinkProps {
  questionText?: string;
  linkText?: string;
  onPress?: () => void;
}

export function SignInLink({
  questionText = 'Already have an account?',
  linkText = 'Sign In',
  onPress,
}: SignInLinkProps) {
  const { textColor } = useAuthColors();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push('/(auth)/sign-in');
    }
  };

  return (
    <View style={styles.signInLink}>
      <Text style={[styles.signInText, { color: textColor }]}>{questionText} </Text>
      <TouchableOpacity onPress={handlePress}>
        <Text style={styles.signInLinkText}>{linkText}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  signInLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  signInText: {
    fontSize: 14,
  },
  signInLinkText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563EB',
  },
});
