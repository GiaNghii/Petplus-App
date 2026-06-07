import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../utils/theme';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  rightIcon?: string;
  onRightPress?: () => void;
  showBack?: boolean;
  variant?: 'default' | 'primary' | 'transparent';
  style?: ViewStyle;
}

export default function Header({
  title,
  subtitle,
  onBack,
  rightIcon,
  onRightPress,
  showBack = true,
  variant = 'default',
  style,
}: HeaderProps) {
  const getBgColor = () => {
    switch (variant) {
      case 'primary': return theme.colors.primary;
      case 'transparent': return 'transparent';
      default: return theme.colors.surface;
    }
  };

  const getTitleColor = () => {
    return variant === 'primary' ? theme.colors.textOnPrimary : theme.colors.textPrimary;
  };

  const getSubtitleColor = () => {
    return variant === 'primary' ? 'rgba(255,255,255,0.85)' : theme.colors.textSecondary;
  };

  return (
    <View style={[
      styles.container,
      { backgroundColor: getBgColor() },
      variant === 'default' && styles.shadow,
      style,
    ]}>
      <View style={styles.leftSection}>
        {showBack && (
          <TouchableOpacity
            onPress={onBack}
            style={[
              styles.iconButton,
              variant === 'primary' && styles.iconButtonOnPrimary,
            ]}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={[
              styles.iconText,
              variant === 'primary' && { color: theme.colors.textOnPrimary }
            ]}>←</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.titleSection}>
        <Text style={[styles.title, { color: getTitleColor() }]} numberOfLines={1}>
          {title}
        </Text>
        {subtitle && (
          <Text style={[styles.subtitle, { color: getSubtitleColor() }]} numberOfLines={1}>
            {subtitle}
          </Text>
        )}
      </View>

      <View style={styles.rightSection}>
        {rightIcon && (
          <TouchableOpacity
            onPress={onRightPress}
            style={[
              styles.iconButton,
              variant === 'primary' && styles.iconButtonOnPrimary,
            ]}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={[
              styles.iconText,
              variant === 'primary' && { color: theme.colors.textOnPrimary }
            ]}>{rightIcon}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    minHeight: 56,
  },
  shadow: {
    ...theme.shadow.sm,
  },
  leftSection: {
    width: 44,
    alignItems: 'flex-start',
  },
  rightSection: {
    width: 44,
    alignItems: 'flex-end',
  },
  titleSection: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
  },
  title: {
    ...theme.typography.h4,
    fontSize: 17,
    fontWeight: '600',
  },
  subtitle: {
    ...theme.typography.caption,
    fontSize: 12,
    marginTop: 2,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surfaceAlt,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconButtonOnPrimary: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  iconText: {
    fontSize: 22,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
});
