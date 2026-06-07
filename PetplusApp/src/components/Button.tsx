import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { theme, commonStyles } from '../utils/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: string;
  disabled?: boolean;
  style?: ViewStyle;
  fullWidth?: boolean;
}

export default function Button({ 
  title, 
  onPress, 
  variant = 'primary', 
  size = 'md',
  icon,
  disabled = false,
  style,
  fullWidth = false,
}: ButtonProps) {
  const getBackgroundColor = () => {
    if (disabled) return theme.colors.borderLight;
    switch (variant) {
      case 'primary': return theme.colors.primary;
      case 'secondary': return theme.colors.primaryBg;
      case 'outline': return 'transparent';
      case 'ghost': return 'transparent';
      case 'danger': return theme.colors.danger;
      default: return theme.colors.primary;
    }
  };

  const getTextColor = () => {
    if (disabled) return theme.colors.textDisabled;
    switch (variant) {
      case 'primary': return theme.colors.textOnPrimary;
      case 'secondary': return theme.colors.primaryDarker;
      case 'outline': return theme.colors.primaryDarker;
      case 'ghost': return theme.colors.primaryDarker;
      case 'danger': return theme.colors.textOnPrimary;
      default: return theme.colors.textOnPrimary;
    }
  };

  const getPadding = () => {
    switch (size) {
      case 'sm': return { paddingVertical: 8, paddingHorizontal: 16 };
      case 'md': return { paddingVertical: 14, paddingHorizontal: 24 };
      case 'lg': return { paddingVertical: 18, paddingHorizontal: 28 };
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        getPadding(),
        { 
          backgroundColor: getBackgroundColor(),
          borderWidth: variant === 'outline' ? 1.5 : 0,
          borderColor: theme.colors.primary,
          width: fullWidth ? '100%' : 'auto',
          opacity: disabled ? 0.6 : 1,
        },
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      {icon && <Text style={styles.icon}>{icon}</Text>}
      <Text style={[
        commonStyles.button.text,
        { color: getTextColor(), fontSize: size === 'sm' ? 14 : 16 }
      ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.md,
    gap: theme.spacing.sm,
  },
  icon: {
    fontSize: 18,
  },
});
