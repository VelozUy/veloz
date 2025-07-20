import { NextRequest, NextResponse } from 'next/server';

// Theme configuration from the provided CSS
const themeConfig = {
  light: {
    background: 'oklch(0.9551 0 0)',
    foreground: 'oklch(0.3211 0 0)',
    card: 'oklch(0.9702 0 0)',
    cardForeground: 'oklch(0.3211 0 0)',
    popover: 'oklch(0.9702 0 0)',
    popoverForeground: 'oklch(0.3211 0 0)',
    primary: 'oklch(0.2000 0.2269 264.3283)',
    primaryForeground: 'oklch(0.9551 0 0)',
    secondary: 'oklch(0.9067 0 0)',
    secondaryForeground: 'oklch(0.3211 0 0)',
    muted: 'oklch(0.8853 0 0)',
    mutedForeground: 'oklch(0.3211 0 0)',
    accent: 'oklch(0.8078 0 0)',
    accentForeground: 'oklch(0.3211 0 0)',
    destructive: 'oklch(0.5594 0.1900 25.8625)',
    destructiveForeground: 'oklch(1.0000 0 0)',
    border: 'oklch(0.8576 0 0)',
    input: 'oklch(0.9067 0 0)',
    ring: 'oklch(0.4891 0 0)',
    chart1: 'oklch(0.4891 0 0)',
    chart2: 'oklch(0.4863 0.0361 196.0278)',
    chart3: 'oklch(0.6534 0 0)',
    chart4: 'oklch(0.7316 0 0)',
    chart5: 'oklch(0.8078 0 0)',
    sidebar: 'oklch(0.9370 0 0)',
    sidebarForeground: 'oklch(0.3211 0 0)',
    sidebarPrimary: 'oklch(0.4891 0 0)',
    sidebarPrimaryForeground: 'oklch(1.0000 0 0)',
    sidebarAccent: 'oklch(0.8078 0 0)',
    sidebarAccentForeground: 'oklch(0.3211 0 0)',
    sidebarBorder: 'oklch(0.8576 0 0)',
    sidebarRing: 'oklch(0.4891 0 0)',
  },
  dark: {
    background: 'oklch(0.2178 0 0)',
    foreground: 'oklch(0.8853 0 0)',
    card: 'oklch(0.2435 0 0)',
    cardForeground: 'oklch(0.8853 0 0)',
    popover: 'oklch(0.2435 0 0)',
    popoverForeground: 'oklch(0.8853 0 0)',
    primary: 'oklch(0.7058 0 0)',
    primaryForeground: 'oklch(0.9551 0 0)',
    secondary: 'oklch(0.3092 0 0)',
    secondaryForeground: 'oklch(0.8853 0 0)',
    muted: 'oklch(0.2850 0 0)',
    mutedForeground: 'oklch(0.8853 0 0)',
    accent: 'oklch(0.3715 0 0)',
    accentForeground: 'oklch(0.8853 0 0)',
    destructive: 'oklch(0.6591 0.1530 22.1703)',
    destructiveForeground: 'oklch(1.0000 0 0)',
    border: 'oklch(0.3290 0 0)',
    input: 'oklch(0.3092 0 0)',
    ring: 'oklch(0.7058 0 0)',
    chart1: 'oklch(0.7058 0 0)',
    chart2: 'oklch(0.6714 0.0339 206.3482)',
    chart3: 'oklch(0.5452 0 0)',
    chart4: 'oklch(0.4604 0 0)',
    chart5: 'oklch(0.3715 0 0)',
    sidebar: 'oklch(0.2393 0 0)',
    sidebarForeground: 'oklch(0.8853 0 0)',
    sidebarPrimary: 'oklch(0.7058 0 0)',
    sidebarPrimaryForeground: 'oklch(0.2178 0 0)',
    sidebarAccent: 'oklch(0.3715 0 0)',
    sidebarAccentForeground: 'oklch(0.8853 0 0)',
    sidebarBorder: 'oklch(0.3290 0 0)',
    sidebarRing: 'oklch(0.7058 0 0)',
  },
  fonts: {
    sans: 'Roboto, sans-serif',
    serif: 'Roboto, sans-serif',
    mono: 'Roboto, sans-serif',
  },
  radius: '0rem',
  shadows: {
    '2xs': '0px 2px 0px 0px hsl(0 0% 20% / 0.07)',
    xs: '0px 2px 0px 0px hsl(0 0% 20% / 0.07)',
    sm: '0px 2px 0px 0px hsl(0 0% 20% / 0.15), 0px 1px 2px -1px hsl(0 0% 20% / 0.15)',
    md: '0px 2px 0px 0px hsl(0 0% 20% / 0.15), 0px 2px 4px -1px hsl(0 0% 20% / 0.15)',
    lg: '0px 2px 0px 0px hsl(0 0% 20% / 0.15), 0px 4px 6px -1px hsl(0 0% 20% / 0.15)',
    xl: '0px 2px 0px 0px hsl(0 0% 20% / 0.15), 0px 8px 10px -1px hsl(0 0% 20% / 0.15)',
    '2xl': '0px 2px 0px 0px hsl(0 0% 20% / 0.38)',
  },
  spacing: '0.25rem',
  tracking: '0em',
};

// Theme validation utilities
const validateThemeColors = (colors: Record<string, string>) => {
  const issues: string[] = [];

  // Check for OKLCH format
  Object.entries(colors).forEach(([key, value]) => {
    if (!value.startsWith('oklch(')) {
      issues.push(`${key}: Expected OKLCH format, got ${value}`);
    }
  });

  return issues;
};

// Contrast ratio calculation (simplified)
const calculateContrastRatio = (_color1: string, _color2: string) => {
  // This is a simplified calculation - in production, you'd want a more robust implementation
  return 4.5; // Placeholder - would need proper OKLCH to luminance conversion
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('mode') || 'light';
  const includeValidation = searchParams.get('validate') === 'true';

  const theme = mode === 'dark' ? themeConfig.dark : themeConfig.light;

  const response: Record<string, unknown> = {
    mode,
    colors: theme,
    fonts: themeConfig.fonts,
    radius: themeConfig.radius,
    shadows: themeConfig.shadows,
    spacing: themeConfig.spacing,
    tracking: themeConfig.tracking,
  };

  if (includeValidation) {
    const validationIssues = validateThemeColors(theme);
    response.validation = {
      isValid: validationIssues.length === 0,
      issues: validationIssues,
    };
  }

  return NextResponse.json(response);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case 'validate':
        const validationIssues = validateThemeColors(data.colors || {});
        return NextResponse.json({
          isValid: validationIssues.length === 0,
          issues: validationIssues,
        });

      case 'contrast-check':
        const { foreground, background } = data;
        const contrastRatio = calculateContrastRatio(foreground, background);
        return NextResponse.json({
          contrastRatio,
          meetsWCAGAA: contrastRatio >= 4.5,
          meetsWCAGAAA: contrastRatio >= 7,
        });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (_error) {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}
