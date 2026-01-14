import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuthColors } from '@/hooks/use-auth-colors';

interface EmailInputProps {
  value: string;
  onChangeText: (text: string) => void;
}

export function EmailInput({ value, onChangeText }: EmailInputProps) {
  const { textColor, borderColor, inputBg, placeholderColor } = useAuthColors();

  return (
    <View style={styles.inputContainer}>
      <Text style={[styles.label, { color: textColor }]}>Email Address</Text>
      <View style={[styles.inputWrapper, { borderColor, backgroundColor: inputBg }]}>
        <MaterialIcons name="email" size={20} color={placeholderColor} style={styles.inputIcon} />
        <TextInput
          style={[styles.input, { color: textColor }]}
          placeholder="Enter your email"
          placeholderTextColor={placeholderColor}
          value={value}
          onChangeText={onChangeText}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
});
