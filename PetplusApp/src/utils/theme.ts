// Petplus Modern Design System
// Premium, app-native, anti-generic aesthetic

export const theme = {
  colors: {
    // Primary — Deep Emerald (premium, trustworthy, medical)
    primary: '#0D7A5F',
    primaryDark: '#095C47',
    primaryDarker: '#064033',
    primaryLight: '#4DAF94',
    primaryLighter: '#A8E0D0',
    primaryBg: '#E8F5F1',

    // Secondary — Warm Sand/Coral (friendly accent)
    secondary: '#E76F51',
    secondaryLight: '#F4A261',
    secondaryBg: '#FFF0EB',

    // Accent — Soft Gold for badges/highlights
    accent: '#E9C46A',
    accentBg: '#FFF8E1',

    // Status
    success: '#0D7A5F',
    successBg: '#E8F5F1',
    warning: '#F4A261',
    warningBg: '#FFF5E6',
    danger: '#E63946',
    dangerBg: '#FFECEE',
    info: '#457B9D',
    infoBg: '#EAF2F7',

    // Neutrals — Cool gray family for modern feel
    background: '#FAFBF9',
    surface: '#FFFFFF',
    surfaceAlt: '#F5F7F5',
    border: '#E5E9E7',
    borderLight: '#EDF1EF',
    divider: '#F0F2F1',

    // Text
    textPrimary: '#1A1D1C',
    textSecondary: '#5E6966',
    textTertiary: '#8E9A96',
    textDisabled: '#B8C4C0',
    textOnPrimary: '#FFFFFF',
    textLink: '#0D7A5F',

    // Pet type colors
    dog: '#E76F51',
    cat: '#7B68EE',
    other: '#4DB6AC',

    // Gradients (use in style arrays)
    gradientPrimary: ['#0D7A5F', '#14967A'] as const,
    gradientWarm: ['#F4A261', '#E76F51'] as const,
    gradientSurface: ['#FFFFFF', '#FAFBF9'] as const,
  },

  // Typography — refined scale with tighter tracking for headers
  typography: {
    display: {
      fontSize: 32,
      fontWeight: '800' as const,
      lineHeight: 40,
      letterSpacing: -0.5,
    },
    h1: {
      fontSize: 28,
      fontWeight: '700' as const,
      lineHeight: 36,
      letterSpacing: -0.3,
    },
    h2: {
      fontSize: 24,
      fontWeight: '700' as const,
      lineHeight: 32,
      letterSpacing: -0.2,
    },
    h3: {
      fontSize: 20,
      fontWeight: '600' as const,
      lineHeight: 28,
      letterSpacing: -0.1,
    },
    h4: {
      fontSize: 18,
      fontWeight: '600' as const,
      lineHeight: 24,
      letterSpacing: -0.1,
    },
    body: {
      fontSize: 16,
      fontWeight: '400' as const,
      lineHeight: 24,
      letterSpacing: 0,
    },
    bodyBold: {
      fontSize: 16,
      fontWeight: '600' as const,
      lineHeight: 24,
      letterSpacing: 0,
    },
    small: {
      fontSize: 14,
      fontWeight: '400' as const,
      lineHeight: 20,
      letterSpacing: 0,
    },
    smallBold: {
      fontSize: 14,
      fontWeight: '600' as const,
      lineHeight: 20,
      letterSpacing: 0,
    },
    caption: {
      fontSize: 12,
      fontWeight: '400' as const,
      lineHeight: 16,
      letterSpacing: 0.2,
    },
    overline: {
      fontSize: 11,
      fontWeight: '600' as const,
      lineHeight: 14,
      letterSpacing: 0.8,
    },
    button: {
      fontSize: 16,
      fontWeight: '600' as const,
      lineHeight: 24,
      letterSpacing: 0,
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

  // Border Radius — modern large radius
  radius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    pill: 999,
    round: 999,
  },

  // Shadows — layered, tinted shadows for depth
  shadow: {
    xs: {
      shadowColor: '#0D7A5F',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04,
      shadowRadius: 2,
      elevation: 1,
    },
    sm: {
      shadowColor: '#1A1D1C',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 4,
      elevation: 2,
    },
    md: {
      shadowColor: '#1A1D1C',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 4,
    },
    lg: {
      shadowColor: '#1A1D1C',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 24,
      elevation: 8,
    },
  },

  // Animation
  animation: {
    fast: 150,
    normal: 250,
    slow: 400,
    spring: {
      tension: 300,
      friction: 10,
    },
  },
};

// Common component styles
export const commonStyles = {
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.lg,
    ...theme.shadow.md,
  },
  button: {
    primary: {
      backgroundColor: theme.colors.primary,
      borderRadius: theme.radius.pill,
      paddingVertical: theme.spacing.lg,
      paddingHorizontal: theme.spacing.xxl,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    },
    secondary: {
      backgroundColor: theme.colors.primaryBg,
      borderRadius: theme.radius.pill,
      paddingVertical: theme.spacing.lg,
      paddingHorizontal: theme.spacing.xxl,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    },
    text: {
      color: theme.colors.textOnPrimary,
      fontSize: 16,
      fontWeight: '600' as const,
    },
  },
  input: {
    backgroundColor: theme.colors.surfaceAlt,
    borderRadius: theme.radius.lg,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    fontSize: 16,
    color: theme.colors.textPrimary,
    borderWidth: 1.5,
    borderColor: theme.colors.borderLight,
  },
  badge: {
    backgroundColor: theme.colors.primaryBg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 4,
    borderRadius: theme.radius.pill,
    alignSelf: 'flex-start' as const,
  },
  badgeText: {
    color: theme.colors.primaryDarker,
    fontSize: 12,
    fontWeight: '600' as const,
  },
};
