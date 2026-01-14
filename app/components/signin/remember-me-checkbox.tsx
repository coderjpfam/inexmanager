import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuthColors } from '@/hooks/use-auth-colors';

interface RememberMeCheckboxProps {
  checked: boolean;
  onToggle: () => void;
}

export function RememberMeCheckbox({ checked, onToggle }: RememberMeCheckboxProps) {
  const { textColor, borderColor, inputBg } = useAuthColors();

  return (
    <TouchableOpacity style={styles.checkboxContainer} onPress={onToggle}>
      <View
        style={[
          styles.checkbox,
          { backgroundColor: inputBg, borderColor },
          checked && styles.checkboxChecked,
        ]}
      >
        {checked && <MaterialIcons name="check" size={16} color="#2563EB" />}
      </View>
      <Text style={[styles.checkboxLabel, { color: textColor }]}>Remember me</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB',
  },
  checkboxLabel: {
    fontSize: 14,
    marginLeft: 8,
  },
});
