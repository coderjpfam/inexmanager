import React from 'react';
import { View, StyleSheet } from 'react-native';

interface OptionsRowProps {
  children: React.ReactNode;
}

export function OptionsRow({ children }: OptionsRowProps) {
  return <View style={styles.optionsRow}>{children}</View>;
}

const styles = StyleSheet.create({
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
});
