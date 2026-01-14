import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuthColors } from '@/hooks/use-auth-colors';

export function AuthFooter() {
  const { placeholderColor } = useAuthColors();

  return (
    <View style={styles.footer}>
      <Text style={[styles.footerText, { color: placeholderColor }]}>
        By continuing, you agree to our{' '}
        <Text style={styles.footerLink}>Terms of Service</Text>
        {' '}and{' '}
        <Text style={styles.footerLink}>Privacy Policy</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  footerText: {
    fontSize: 12,
    textAlign: 'center',
  },
  footerLink: {
    color: '#2563EB',
    fontWeight: '500',
  },
});
