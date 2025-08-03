import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '1.5rem',
        lg: '2rem',
        xl: '2.5rem',
        '2xl': '3rem',
      },
      screens: {
        sm: '640px',
        md: '768px',
        lg: '1200px', // Increased from 1024px
        xl: '1400px', // Increased from 1280px
        '2xl': '1600px', // Increased from 1536px
      },
      maxWidth: {
        '7xl': '80rem', // 1280px - default 7xl
        '7.5xl': '84rem', // 1344px - between 7xl and 8xl
        '8xl': '88rem', // 1408px - wider than 7xl
        '9xl': '96rem', // 1536px - even wider
        'border-64': 'calc(100vw - 128px)', // 64px from each side
      },
    },
    extend: {
      // Veloz brand color system
      colors: {
        // Veloz brand colors
        'veloz-blue': '#0019AA',
        'veloz-blue-hover': '#000f75',
        'carbon-black': '#212223',
        'light-gray-1': '#d4d4d4',
        'light-gray-2': '#afafaf',
        'light-gray-2-hover': '#999999',

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
        'spin-slow': 'spin 3s linear infinite',
        'target-bounce': 'targetBounce 1.2s ease-in-out infinite',
        'target-pulse': 'targetPulse 1.5s ease-in-out infinite',
        'target-scale': 'targetScale 2s ease-in-out infinite',
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
        spin: {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        targetBounce: {
          '0%, 100%': { transform: 'scale(1) translateY(0)' },
          '25%': { transform: 'scale(1.1) translateY(-2px)' },
          '50%': { transform: 'scale(0.9) translateY(0)' },
          '75%': { transform: 'scale(1.05) translateY(-1px)' },
        },
        targetPulse: {
          '0%, 100%': {
            transform: 'scale(1)',
            opacity: '0.8',
          },
          '50%': {
            transform: 'scale(1.15)',
            opacity: '1',
          },
        },
        targetScale: {
          '0%, 100%': { transform: 'scale(1)' },
          '33%': { transform: 'scale(1.2)' },
          '66%': { transform: 'scale(0.8)' },
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
