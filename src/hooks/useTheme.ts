import { useMemo } from 'react';
import {
  getThemeColors,
  getThemeCSSVariables,
  validateThemeAccessibility,
} from '@/lib/theme-utils';

export type ThemeMode = 'light';

interface ThemeState {
  mode: ThemeMode;
  colors: ReturnType<typeof getThemeColors>;
  cssVariables: Record<string, string>;
  isValid: boolean;
  accessibilityIssues: string[];
}

interface UseThemeReturn extends ThemeState {
  applyToElement: (element: HTMLElement) => void;
  getComponentStyles: (component: string) => Record<string, string>;
}

/**
 * React hook for single theme management
 * Provides theme state and utility methods for the fixed light theme
 */
export function useTheme(mode: ThemeMode = 'light'): UseThemeReturn {
  const state = useMemo<ThemeState>(() => {
    const colors = getThemeColors(mode);
    const cssVariables = getThemeCSSVariables(mode);
    const accessibility = validateThemeAccessibility(mode);

    return {
      mode,
      colors,
      cssVariables,
      isValid: accessibility.isValid,
      accessibilityIssues: accessibility.issues,
    };
  }, [mode]);

  // Apply theme to a specific element
  const applyToElement = (element: HTMLElement) => {
    Object.entries(state.cssVariables).forEach(([property, value]) => {
      element.style.setProperty(property, value);
    });
  };

  // Get component-specific styles
  const getComponentStyles = (component: string) => {
    const baseStyles = {
      button: {
        primary: `bg-[${state.colors.primary}] text-[${state.colors.primaryForeground}]`,
        secondary: `bg-[${state.colors.secondary}] text-[${state.colors.secondaryForeground}]`,
        destructive: `bg-[${state.colors.destructive}] text-[${state.colors.destructiveForeground}]`,
      },
      card: {
        default: `bg-[${state.colors.card}] text-[${state.colors.cardForeground}]`,
      },
      input: {
        default: `bg-[${state.colors.input}] border-[${state.colors.border}]`,
      },
    };

    return baseStyles[component as keyof typeof baseStyles] || {};
  };

  return {
    ...state,
    applyToElement,
    getComponentStyles,
  };
}

/**
 * Hook for theme-aware styling
 * Returns theme-aware class names and styles for light theme
 */
export function useThemeStyles(mode: ThemeMode = 'light') {
  const { colors } = useTheme(mode);

  const styles = {
    // Background styles
    background: `bg-[${colors.background}]`,
    foreground: `text-[${colors.foreground}]`,

    // Card styles
    card: `bg-[${colors.card}] text-[${colors.cardForeground}] border-[${colors.border}]`,
    cardElevated: `bg-[${colors.card}] text-[${colors.cardForeground}] shadow-md`,

    // Button styles
    buttonPrimary: `bg-[${colors.primary}] text-[${colors.primaryForeground}] hover:opacity-90`,
    buttonSecondary: `bg-[${colors.secondary}] text-[${colors.secondaryForeground}] hover:opacity-90`,
    buttonDestructive: `bg-[${colors.destructive}] text-[${colors.destructiveForeground}] hover:opacity-90`,
    buttonOutline: `border-[${colors.border}] text-[${colors.foreground}] hover:bg-[${colors.accent}]`,
    buttonGhost: `text-[${colors.foreground}] hover:bg-[${colors.accent}]`,

    // Form styles
    input: `bg-[${colors.input}] border-[${colors.border}] text-[${colors.foreground}]`,
    inputFocus: `ring-[${colors.ring}]`,

    // Navigation styles
    sidebar: `bg-[${colors.sidebar}] text-[${colors.sidebarForeground}]`,
    sidebarItem: `hover:bg-[${colors.sidebarAccent}]`,
    sidebarActive: `bg-[${colors.sidebarPrimary}] text-[${colors.sidebarPrimaryForeground}]`,

    // Status styles
    muted: `bg-[${colors.muted}] text-[${colors.mutedForeground}]`,
    accent: `bg-[${colors.accent}] text-[${colors.accentForeground}]`,

    // Border styles
    border: `border-[${colors.border}]`,
    ring: `ring-[${colors.ring}]`,
  };

  return {
    styles,
    mode,
    colors,
  };
}

/**
 * Hook for theme validation and accessibility
 * Validates the light theme for accessibility compliance
 */
export function useThemeValidation(mode: ThemeMode = 'light') {
  const { isValid, accessibilityIssues } = useTheme(mode);

  return {
    isValid,
    issues: accessibilityIssues,
    mode,
    hasIssues: accessibilityIssues.length > 0,
    criticalIssues: accessibilityIssues.filter(
      issue => issue.includes('WCAG AA') || issue.includes('contrast')
    ),
  };
}
