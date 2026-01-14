import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

interface SubmitButtonProps {
  label: string;
  onPress: () => void;
}

export function SubmitButton({ label, onPress }: SubmitButtonProps) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.submitButton} activeOpacity={0.8}>
      <Text style={styles.submitButtonText}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
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
});
