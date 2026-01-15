import React from 'react';
import Toast from 'react-native-toast-message';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';
import { MaterialIcons } from '@expo/vector-icons';

/**
 * Custom toast configuration component
 * Configures toast messages to appear in the top right corner
 */
export function ToastConfig() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');

  return (
    <Toast
      config={{
        success: ({ text1, text2 }) => (
          <View style={[styles.toast, styles.successToast, { backgroundColor }]}>
            <MaterialIcons name="check-circle" size={24} color="#10B981" style={styles.icon} />
            <View style={styles.textContainer}>
              {text1 && <Text style={[styles.text1, { color: textColor }]}>{text1}</Text>}
              {text2 && <Text style={[styles.text2, { color: textColor }]}>{text2}</Text>}
            </View>
          </View>
        ),
        error: ({ text1, text2 }) => (
          <View style={[styles.toast, styles.errorToast, { backgroundColor }]}>
            <MaterialIcons name="error" size={24} color="#EF4444" style={styles.icon} />
            <View style={styles.textContainer}>
              {text1 && <Text style={[styles.text1, { color: textColor }]}>{text1}</Text>}
              {text2 && <Text style={[styles.text2, { color: textColor }]}>{text2}</Text>}
            </View>
          </View>
        ),
        info: ({ text1, text2 }) => (
          <View style={[styles.toast, styles.infoToast, { backgroundColor }]}>
            <MaterialIcons name="info" size={24} color="#2563EB" style={styles.icon} />
            <View style={styles.textContainer}>
              {text1 && <Text style={[styles.text1, { color: textColor }]}>{text1}</Text>}
              {text2 && <Text style={[styles.text2, { color: textColor }]}>{text2}</Text>}
            </View>
          </View>
        ),
        warning: ({ text1, text2 }) => (
          <View style={[styles.toast, styles.warningToast, { backgroundColor }]}>
            <MaterialIcons name="warning" size={24} color="#F59E0B" style={styles.icon} />
            <View style={styles.textContainer}>
              {text1 && <Text style={[styles.text1, { color: textColor }]}>{text1}</Text>}
              {text2 && <Text style={[styles.text2, { color: textColor }]}>{text2}</Text>}
            </View>
          </View>
        ),
      }}
      position="top"
      topOffset={60}
    />
  );
}

const styles = StyleSheet.create({
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 60,
    width: '85%',
    maxWidth: 400,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    borderLeftWidth: 4,
    alignSelf: 'flex-end',
    marginRight: 16,
  },
  successToast: {
    borderLeftColor: '#10B981',
    backgroundColor: '#F0FDF4',
  },
  errorToast: {
    borderLeftColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  infoToast: {
    borderLeftColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  warningToast: {
    borderLeftColor: '#F59E0B',
    backgroundColor: '#FFFBEB',
  },
  icon: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  text1: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  text2: {
    fontSize: 14,
    fontWeight: '400',
    opacity: 0.8,
  },
});
