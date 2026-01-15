import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuthColors } from '@/hooks/use-auth-colors';

interface FullNameInputProps {
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
}

export function FullNameInput({ value, onChangeText, error }: FullNameInputProps) {
  const { textColor, borderColor, inputBg, placeholderColor } = useAuthColors();

  return (
    <View style={styles.inputContainer}>
      <Text style={[styles.label, { color: textColor }]}>Full Name</Text>
      <View style={[
        styles.inputWrapper, 
        { borderColor: error ? '#EF4444' : borderColor, backgroundColor: inputBg }
      ]}>
        <MaterialIcons name="person" size={20} color={error ? '#EF4444' : placeholderColor} style={styles.inputIcon} />
        <TextInput
          style={[styles.input, { color: textColor }]}
          placeholder="Enter your full name"
          placeholderTextColor={placeholderColor}
          value={value}
          onChangeText={onChangeText}
          autoCapitalize="words"
          autoCorrect={false}
        />
      </View>
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
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
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
});
