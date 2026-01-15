/**
 * Password Strength Indicator Component
 * Shows visual feedback for password strength
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useAuthColors } from '@/hooks/use-auth-colors';
import { validatePassword, PasswordValidation } from '@/utils/validation';

interface PasswordStrengthIndicatorProps {
  password: string;
}

export function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  const { textColor } = useAuthColors();
  
  if (!password || password.length === 0) {
    return null;
  }

  const validation = validatePassword(password);
  const { strength, requirements } = validation;

  // Color based on strength
  const strengthColors = {
    weak: '#EF4444', // Red
    medium: '#F59E0B', // Orange
    strong: '#10B981', // Green
  };

  const strengthLabels = {
    weak: 'Weak',
    medium: 'Medium',
    strong: 'Strong',
  };

  const strengthColor = strengthColors[strength];
  const strengthLabel = strengthLabels[strength];

  return (
    <View style={styles.container}>
      <View style={styles.strengthBar}>
        <View
          style={[
            styles.strengthFill,
            {
              width: `${(Object.values(requirements).filter(Boolean).length / 5) * 100}%`,
              backgroundColor: strengthColor,
            },
          ]}
        />
      </View>
      <View style={styles.infoContainer}>
        <ThemedText style={[styles.strengthLabel, { color: strengthColor }]}>
          {strengthLabel}
        </ThemedText>
        <View style={styles.requirementsList}>
          <RequirementItem
            met={requirements.minLength}
            text="At least 8 characters"
            textColor={textColor}
          />
          <RequirementItem
            met={requirements.hasLowercase}
            text="One lowercase letter"
            textColor={textColor}
          />
          <RequirementItem
            met={requirements.hasUppercase}
            text="One uppercase letter"
            textColor={textColor}
          />
          <RequirementItem
            met={requirements.hasNumber}
            text="One number"
            textColor={textColor}
          />
          <RequirementItem
            met={requirements.hasSpecialChar}
            text="One special character (@$!%*?&)"
            textColor={textColor}
          />
        </View>
      </View>
    </View>
  );
}

interface RequirementItemProps {
  met: boolean;
  text: string;
  textColor: string;
}

function RequirementItem({ met, text, textColor }: RequirementItemProps) {
  return (
    <View style={styles.requirementItem}>
      <Text style={[styles.checkmark, { color: met ? '#10B981' : '#6B7280' }]}>
        {met ? '✓' : '○'}
      </Text>
      <ThemedText style={[styles.requirementText, { color: met ? textColor : '#6B7280' }]}>
        {text}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  strengthBar: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 12,
  },
  strengthFill: {
    height: '100%',
    borderRadius: 2,
    transition: 'width 0.3s ease',
  },
  infoContainer: {
    gap: 8,
  },
  strengthLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  requirementsList: {
    gap: 6,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkmark: {
    fontSize: 14,
    width: 16,
    textAlign: 'center',
  },
  requirementText: {
    fontSize: 12,
  },
});
