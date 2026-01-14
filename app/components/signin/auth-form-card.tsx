import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useAuthColors } from '@/hooks/use-auth-colors';

interface AuthFormCardProps {
  children: React.ReactNode;
}

export function AuthFormCard({ children }: AuthFormCardProps) {
  const { cardBg } = useAuthColors();

  return (
    <View style={[styles.card, { backgroundColor: cardBg }]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
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
});
