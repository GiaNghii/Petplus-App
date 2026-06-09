import React from 'react';
import { View, Text, TextInput, TextInputProps, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../utils/theme';
import Icon, { IconName } from './Icon';

interface InputProps extends TextInputProps {
  label?: string;
  icon?: IconName;
  error?: string;
  containerStyle?: ViewStyle;
}

export default function Input({ label, icon, error, containerStyle, style, ...props }: InputProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[
        styles.inputWrapper,
        error ? styles.inputError : null,
      ]}>
        {icon && <Icon name={icon} size={20} color={theme.colors.textSecondary} style={{ marginRight: theme.spacing.sm }} />}
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={theme.colors.textTertiary}
          {...props}
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    ...theme.typography.smallBold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceAlt,
    borderRadius: theme.radius.lg,
    paddingHorizontal: theme.spacing.lg,
    borderWidth: 1.5,
    borderColor: theme.colors.borderLight,
  },
  inputError: {
    borderColor: theme.colors.danger,
    backgroundColor: theme.colors.dangerBg,
  },
  input: {
    flex: 1,
    paddingVertical: theme.spacing.lg,
    fontSize: 16,
    color: theme.colors.textPrimary,
  },
  errorText: {
    ...theme.typography.caption,
    color: theme.colors.danger,
    marginTop: theme.spacing.xs,
  },
});
