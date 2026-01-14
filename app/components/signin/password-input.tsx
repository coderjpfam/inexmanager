import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuthColors } from '@/hooks/use-auth-colors';

interface PasswordInputProps {
  value: string;
  onChangeText: (text: string) => void;
  showPassword: boolean;
  onToggleVisibility: () => void;
  label?: string;
  placeholder?: string;
}

export function PasswordInput({
  value,
  onChangeText,
  showPassword,
  onToggleVisibility,
  label = 'Password',
  placeholder = 'Enter your password',
}: PasswordInputProps) {
  const { textColor, borderColor, inputBg, placeholderColor } = useAuthColors();

  return (
    <View style={styles.inputContainer}>
      <Text style={[styles.label, { color: textColor }]}>{label}</Text>
      <View style={[styles.inputWrapper, { borderColor, backgroundColor: inputBg }]}>
        <MaterialIcons name="lock" size={20} color={placeholderColor} style={styles.inputIcon} />
        <TextInput
          style={[styles.input, { color: textColor }]}
          placeholder={placeholder}
          placeholderTextColor={placeholderColor}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity onPress={onToggleVisibility} style={styles.eyeIcon}>
          <MaterialIcons
            name={showPassword ? 'visibility-off' : 'visibility'}
            size={20}
            color={placeholderColor}
          />
        </TouchableOpacity>
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
  eyeIcon: {
    padding: 4,
  },
});
