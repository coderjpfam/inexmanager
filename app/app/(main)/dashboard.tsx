import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { useAppSelector } from '@/hooks/use-redux';
import { useAuthColors } from '@/hooks/use-auth-colors';

export default function DashboardPage() {
  const { user } = useAppSelector((state) => state.auth);
  const { containerBg } = useAuthColors();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: containerBg }]} edges={['top']}>
      <View style={styles.content}>
        <ThemedText type="title" style={styles.title}>
          Dashboard
        </ThemedText>
        {user && (
          <ThemedText style={styles.welcomeText}>
            Welcome, {user.name}!
          </ThemedText>
        )}
        <ThemedText style={styles.description}>
          This is your dashboard. Start managing your income and expenses here.
        </ThemedText>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  welcomeText: {
    fontSize: 18,
    marginBottom: 24,
    opacity: 0.8,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.6,
  },
});
