import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

const RED = '#C8102E';

interface AppButtonProps {
  title: string;
  onPress: () => void;
  secondary?: boolean;
  loading?: boolean;
  disabled?: boolean;
}

export function AppButton({
  title,
  onPress,
  secondary = false,
  loading = false,
  disabled = false,
}: AppButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        secondary && styles.secondaryButton,
        isDisabled && { opacity: 0.7 },
      ]}
      onPress={isDisabled ? undefined : onPress}
      activeOpacity={0.8}
      disabled={isDisabled}
    >
      <Text style={[styles.buttonText, secondary && styles.secondaryText]}>
        {loading ? 'Please wait...' : title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: '100%',
    minHeight: 54,
    backgroundColor: RED,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 12,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: RED,
  },
  secondaryText: {
    color: RED,
  },
});

export default AppButton;
