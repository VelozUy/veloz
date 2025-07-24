import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Comprehensive color system using CSS variables
      colors: {
        // Base color palette
        base: {
          50: 'var(--base-50)',
          100: 'var(--base-100)',
          200: 'var(--base-200)',
          300: 'var(--base-300)',
          400: 'var(--base-400)',
          500: 'var(--base-500)',
          600: 'var(--base-600)',
          700: 'var(--base-700)',
          800: 'var(--base-800)',
          900: 'var(--base-900)',
          950: 'var(--base-950)',
          1000: 'var(--base-1000)',
        },
        // Primary color palette
        'primary-50': 'var(--primary-50)',
        'primary-100': 'var(--primary-100)',
        'primary-200': 'var(--primary-200)',
        'primary-300': 'var(--primary-300)',
        'primary-400': 'var(--primary-400)',
        'primary-500': 'var(--primary-500)',
        'primary-600': 'var(--primary-600)',
        'primary-700': 'var(--primary-700)',
        'primary-800': 'var(--primary-800)',
        'primary-900': 'var(--primary-900)',
        'primary-950': 'var(--primary-950)',
        'primary-1000': 'var(--primary-1000)',
        // Semantic colors
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
        // Legacy colors for backward compatibility
        charcoal: '#1a1b1f',
        'gray-light': '#f0f0f0',
        'gray-medium': '#d2d2d2',
        'blue-accent': '#1d7efc',
        white: '#ffffff',
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
        display: 'var(--font-display)',
        text: 'var(--font-text)',
      },

      // Font weights for display and text
      fontWeight: {
        display: 'var(--display-weight)',
        text: 'var(--text-weight)',
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
        'veloz-hover': 'velozHover 0.35s cubic-bezier(0.4,0,0.2,1)',
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
        velozHover: {
          '0%': { transform: 'scale(1)', filter: 'brightness(1)' },
          '60%': { transform: 'scale(1.045)', filter: 'brightness(1.08)' },
          '100%': { transform: 'scale(1.025)', filter: 'brightness(1.04)' },
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
        tl: '3rem', // Top-left for asymmetrical hero sections
        br: '4rem', // Bottom-right for asymmetrical layout blocks
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
