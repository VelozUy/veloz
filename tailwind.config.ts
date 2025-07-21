import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Theme-based colors using CSS variables only
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: 'var(--card)',
        'card-foreground': 'var(--card-foreground)',
        popover: 'var(--popover)',
        'popover-foreground': 'var(--popover-foreground)',
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        destructive: {
          DEFAULT: 'var(--destructive)',
          foreground: 'var(--destructive-foreground)',
        },
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        chart: {
          '1': 'var(--chart-1)',
          '2': 'var(--chart-2)',
          '3': 'var(--chart-3)',
          '4': 'var(--chart-4)',
          '5': 'var(--chart-5)',
        },
        // Light Gray Background Color System
        charcoal: '#1a1b1f', // Dark base for visual/hero blocks
        'gray-light': '#f0f0f0', // Neutral text sections and forms
        'gray-medium': '#d2d2d2', // Borders and cards
        'blue-accent': '#1d7efc', // CTA and focus elements
        white: '#ffffff', // Elevated cards or clean sections
        // Modern shadcn/ui theme colors using OKLCH color space
        // All colors are now defined via CSS variables in globals.css
      },

      // Typography for Veloz brand - REDJOLA only for logo, Roboto for everything else
      fontFamily: {
        sans: ['Roboto', 'sans-serif'],
        serif: ['Roboto', 'sans-serif'],
        mono: ['Roboto', 'sans-serif'],
        // REDJOLA only for VELOZ brand title in logo
        logo: [
          'REDJOLA',
          'Bebas Neue',
          'Oswald',
          'ui-sans-serif',
          'system-ui',
          'sans-serif',
        ],
        // Roboto for all other text
        body: ['Roboto', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },

      // Spacing system for optimization
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },

      // Animation for agility
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'bounce-gentle': 'bounceGentle 0.6s ease-in-out',
      },

      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
      },

      // Border radius system for modern shadcn/ui theme
      borderRadius: {
        DEFAULT: '0rem', // Default border radius from theme
        sm: '0rem', // Small border radius
        md: '0.375rem', // Medium border radius for inputs and small interactive elements
        lg: '0.5rem', // Large border radius for cards and forms
        xl: '0rem', // Extra large border radius (removed default rounded-xl)
        '2xl': '0rem', // Extra extra large border radius (removed default rounded-2xl)
        full: '9999px', // Full rounded (for badges and pills)
      },

      // Box shadows using CSS variables
      boxShadow: {
        '2xs': 'var(--shadow-2xs)',
        xs: 'var(--shadow-xs)',
        sm: 'var(--shadow-sm)',
        DEFAULT: 'var(--shadow)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        xl: 'var(--shadow-xl)',
        '2xl': 'var(--shadow-2xl)',
      },

      // Backdrop blur for modern glass effect
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};

export default config;
