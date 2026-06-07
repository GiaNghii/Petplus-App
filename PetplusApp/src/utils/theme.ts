// Petplus Design System
// Inspired by petplus.com.vn - clean, friendly, professional

export const theme = {
  // Brand Colors - Petplus green theme
  colors: {
    // Primary - Petplus Green
    primary: '#4CAF50',
    primaryDark: '#388E3C',
    primaryDarker: '#2E7D32',
    primaryLight: '#81C784',
    primaryLighter: '#C8E6C9',
    primaryBg: '#E8F5E9',

    // Secondary - Warm orange accent
    secondary: '#FF8A65',
    secondaryLight: '#FFAB91',
    secondaryBg: '#FFF3E0',

    // Accent - Soft yellow for badges
    accent: '#FFD54F',
    accentBg: '#FFF9C4',

    // Status colors
    success: '#4CAF50',
    successBg: '#E8F5E9',
    warning: '#FF9800',
    warningBg: '#FFF3E0',
    danger: '#F44336',
    dangerBg: '#FFEBEE',
    info: '#2196F3',
    infoBg: '#E3F2FD',

    // Neutrals
    background: '#FAFAFA',
    surface: '#FFFFFF',
    surfaceAlt: '#F5F5F5',
    border: '#E0E0E0',
    borderLight: '#EEEEEE',
    divider: '#F0F0F0',

    // Text
    textPrimary: '#212121',
    textSecondary: '#757575',
    textTertiary: '#9E9E9E',
    textDisabled: '#BDBDBD',
    textOnPrimary: '#FFFFFF',
    textLink: '#2E7D32',

    // Pet type colors
    dog: '#FF8A65',
    cat: '#9575CD',
    other: '#4DB6AC',
  },

  // Typography
  typography: {
    h1: {
      fontSize: 28,
      fontWeight: '700' as const,
      lineHeight: 36,
    },
    h2: {
      fontSize: 24,
      fontWeight: '700' as const,
      lineHeight: 32,
    },
    h3: {
      fontSize: 20,
      fontWeight: '600' as const,
      lineHeight: 28,
    },
    h4: {
      fontSize: 18,
      fontWeight: '600' as const,
      lineHeight: 24,
    },
    body: {
      fontSize: 16,
      fontWeight: '400' as const,
      lineHeight: 24,
    },
    bodyBold: {
      fontSize: 16,
      fontWeight: '600' as const,
      lineHeight: 24,
    },
    small: {
      fontSize: 14,
      fontWeight: '400' as const,
      lineHeight: 20,
    },
    smallBold: {
      fontSize: 14,
      fontWeight: '600' as const,
      lineHeight: 20,
    },
    caption: {
      fontSize: 12,
      fontWeight: '400' as const,
      lineHeight: 16,
    },
    button: {
      fontSize: 16,
      fontWeight: '600' as const,
      lineHeight: 24,
    },
  },

  // Spacing (4px grid)
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    huge: 48,
  },

  // Border Radius
  radius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    round: 999,
  },

  // Shadows
  shadow: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 2,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
  },

  // Animation duration
  animation: {
    fast: 150,
    normal: 250,
    slow: 400,
  },
};

// Common component styles
export const commonStyles = {
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: theme.spacing.lg,
    ...theme.shadow.md,
  },
  button: {
    primary: {
      backgroundColor: theme.colors.primary,
      borderRadius: theme.radius.md,
      paddingVertical: theme.spacing.lg,
      paddingHorizontal: theme.spacing.xxl,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    },
    secondary: {
      backgroundColor: theme.colors.primaryBg,
      borderRadius: theme.radius.md,
      paddingVertical: theme.spacing.lg,
      paddingHorizontal: theme.spacing.xxl,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      borderWidth: 1,
      borderColor: theme.colors.primary,
    },
    text: {
      color: theme.colors.textOnPrimary,
      fontSize: 16,
      fontWeight: '600' as const,
    },
  },
  input: {
    backgroundColor: theme.colors.surfaceAlt,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    fontSize: 16,
    color: theme.colors.textPrimary,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  badge: {
    backgroundColor: theme.colors.primaryBg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 4,
    borderRadius: theme.radius.round,
    alignSelf: 'flex-start' as const,
  },
  badgeText: {
    color: theme.colors.primaryDarker,
    fontSize: 12,
    fontWeight: '600' as const,
  },
};
