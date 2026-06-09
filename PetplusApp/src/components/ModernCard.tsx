import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { theme } from '../utils/theme';

interface ModernCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: keyof typeof theme.spacing;
  onPress?: () => void;
  variant?: 'default' | 'primary' | 'secondary' | 'accent';
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

export default function ModernCard({
  children,
  style,
  padding = 'lg',
  onPress,
  variant = 'default',
  header,
  footer,
}: ModernCardProps) {
  const Wrapper = onPress ? TouchableOpacity : View;
  const wrapperProps = onPress ? { onPress, activeOpacity: 0.9 } : {};

  const variantBg = () => {
    switch (variant) {
      case 'primary': return theme.colors.primary;
      case 'secondary': return theme.colors.secondaryBg;
      case 'accent': return theme.colors.accentBg;
      default: return theme.colors.surface;
    }
  };

  const inner = (
    <>
      {header && (
        <View style={styles.header}>
          {header}
        </View>
      )}
      <View style={[{ padding: theme.spacing[padding] }]}>
        {children}
      </View>
      {footer && (
        <View style={styles.footer}>
          {footer}
        </View>
      )}
    </>
  );

  return (
    <Wrapper {...wrapperProps} style={[
      styles.card,
      { backgroundColor: variantBg() },
      style,
    ]}>
      {inner}
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: theme.radius.xl,
    ...theme.shadow.md,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    overflow: 'hidden',
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.sm,
  },
  footer: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.lg,
  },
});
