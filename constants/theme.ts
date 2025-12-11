export const colors = {
  primary: {
    DEFAULT: '#FF6B35',
    light: '#FF8F66',
    dark: '#E55A2B',
  },
  secondary: {
    DEFAULT: '#4A90D9',
    light: '#6BA8E8',
    dark: '#3A7BC8',
  },
  success: {
    DEFAULT: '#4CAF50',
    light: '#81C784',
    dark: '#388E3C',
  },
  rest: {
    DEFAULT: '#9E9E9E',
    light: '#E0E0E0',
    dark: '#757575',
  },
  background: {
    DEFAULT: '#FFFFFF',
    secondary: '#F5F5F5',
    dark: '#1A1A1A',
  },
  text: {
    primary: '#1A1A1A',
    secondary: '#666666',
    light: '#999999',
    inverse: '#FFFFFF',
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const fontSize = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
} as const;