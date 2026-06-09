import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle, Animated, ActivityIndicator } from 'react-native';
import { theme } from '../utils/theme';
import Icon, { IconName } from './Icon';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: IconName;
  disabled?: boolean;
  loading?: boolean;
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
  loading = false,
  style,
  fullWidth = false,
}: ButtonProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
      friction: 8,
      tension: 300,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 8,
      tension: 300,
    }).start();
  };

  const getBackgroundColor = () => {
    if (disabled || loading) return theme.colors.borderLight;
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
    if (disabled || loading) return theme.colors.textDisabled;
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
      case 'sm': return { paddingVertical: 10, paddingHorizontal: 18 };
      case 'md': return { paddingVertical: 14, paddingHorizontal: 24 };
      case 'lg': return { paddingVertical: 18, paddingHorizontal: 32 };
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'sm': return 14;
      case 'md': return 16;
      case 'lg': return 18;
    }
  };

  const isPill = variant === 'primary' || variant === 'danger';

  return (
    <Animated.View
      style={[
        { transform: [{ scale: scaleAnim }], width: fullWidth ? '100%' : 'auto' },
      ]}
    >
      <TouchableOpacity
        style={[
          styles.button,
          getPadding(),
          {
            backgroundColor: getBackgroundColor(),
            borderWidth: variant === 'outline' ? 1.5 : 0,
            borderColor: variant === 'outline' ? theme.colors.primary : 'transparent',
            borderRadius: isPill ? theme.radius.pill : theme.radius.lg,
            opacity: disabled ? 0.6 : 1,
          },
          style,
        ]}
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.8}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        {loading ? (
          <ActivityIndicator color={getTextColor()} size="small" />
        ) : (
          <>
            {icon && <Icon name={icon} size={getFontSize() + 4} color={getTextColor()} style={{ marginRight: 8 }} />}
            <Text style={[
              styles.text,
              { color: getTextColor(), fontSize: getFontSize() }
            ]}>
              {title}
            </Text>
          </>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
  },
  text: {
    fontWeight: '600',
  },
});
