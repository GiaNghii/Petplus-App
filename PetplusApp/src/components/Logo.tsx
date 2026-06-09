import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../utils/theme';
import Icon from './Icon';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  variant?: 'default' | 'white';
}

export default function Logo({ size = 'md', showText = true, variant = 'default' }: LogoProps) {
  const dimensions = {
    sm: { box: 32, paw: 18, text: 16 },
    md: { box: 48, paw: 26, text: 22 },
    lg: { box: 64, paw: 34, text: 28 },
  }[size];

  const bgColor = variant === 'white' ? 'rgba(255,255,255,0.2)' : theme.colors.primaryBg;
  const textColor = variant === 'white' ? theme.colors.textOnPrimary : theme.colors.primaryDarker;

  return (
    <View style={styles.container}>
      <View style={[
        styles.iconBox,
        {
          width: dimensions.box,
          height: dimensions.box,
          backgroundColor: bgColor,
        }
      ]}>
        <Icon name="paw" size={dimensions.paw} color={textColor} />
      </View>
      {showText && (
        <Text style={[
          styles.logoText,
          { fontSize: dimensions.text, color: textColor }
        ]}>
          Petplus
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  iconBox: {
    borderRadius: theme.radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontWeight: '700',
    letterSpacing: -0.5,
  },
});
