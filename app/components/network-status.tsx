/**
 * Network Status Component
 * Displays network connectivity status to the user
 */

import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNetworkStatus } from '@/hooks/use-network-status';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

export function NetworkStatus() {
  const { isConnected, isInternetReachable } = useNetworkStatus();

  // Only show banner when offline
  if (isConnected && isInternetReachable !== false) {
    return null;
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <MaterialIcons name="wifi-off" size={20} color="#FFFFFF" />
        <ThemedText style={styles.text}>
          {isInternetReachable === false
            ? 'No internet connection'
            : 'Connection unstable'}
        </ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#EF4444',
    paddingVertical: 8,
    paddingHorizontal: 16,
    zIndex: 9999,
    elevation: 5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
});
