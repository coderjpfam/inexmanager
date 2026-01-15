import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { ThemedText } from '@/components/themed-text';

interface AuthHeaderProps {
  subtitle?: string;
}

export function AuthHeader({ subtitle = 'Welcome back! Please sign in' }: AuthHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.logoContainer}>
        <Image
          source={require('@/assets/images/logo.png')}
          style={styles.logo}
          contentFit="contain"
          placeholder={{ blurhash: 'LGF5]+Yk^6#M@-5c,1J5@[or[Q6.' }}
          transition={200}
          accessibilityLabel="Income & Expense Manager Logo"
          accessibilityRole="image"
        />
      </View>
      <ThemedText type="title" style={styles.title}>
        Income & Expense Manager
      </ThemedText>
      <ThemedText style={styles.subtitle}>{subtitle}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  logo: {
    width: 64,
    height: 64,
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
});
