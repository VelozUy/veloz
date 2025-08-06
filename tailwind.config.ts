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
        // Veloz brand colors (legacy support)
        'veloz-blue': '#0019AA',
        'veloz-blue-hover': '#000f75',
        'carbon-black': '#212223',
        'light-gray-1': '#d4d4d4',
        'light-gray-2': '#afafaf',
        'light-gray-2-hover': '#999999',

        // Semantic colors (primary system)
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
        sidebar: {
          DEFAULT: 'var(--sidebar)',
          foreground: 'var(--sidebar-foreground)',
          primary: 'var(--sidebar-primary)',
          'primary-foreground': 'var(--sidebar-primary-foreground)',
          accent: 'var(--sidebar-accent)',
          'accent-foreground': 'var(--sidebar-accent-foreground)',
          border: 'var(--sidebar-border)',
          ring: 'var(--sidebar-ring)',
        },
      },

      // Typography for Veloz brand - REDJOLA only for logo, Roboto for everything else
      fontFamily: {
        // Default fonts
        sans: ['Roboto-Medium', 'sans-serif'],
        serif: ['Roboto-Medium', 'serif'],
        mono: ['Roboto-Medium', 'monospace'],

        // REDJOLA only for VELOZ brand title in logo
        logo: [
          'REDJOLA',
          'Bebas Neue',
          'Oswald',
          'ui-sans-serif',
          'system-ui',
          'sans-serif',
        ],

        // Title fonts - Roboto Black Italic
        title: [
          'Roboto-BlackItalic',
          'ui-sans-serif',
          'system-ui',
          'sans-serif',
        ],

        // Subtitle fonts - Roboto Medium Italic
        subtitle: [
          'Roboto-MediumItalic',
          'ui-sans-serif',
          'system-ui',
          'sans-serif',
        ],

        // Body content fonts - Roboto Medium (not italic)
        body: ['Roboto-Medium', 'ui-sans-serif', 'system-ui', 'sans-serif'],

        // Legacy support
        display: 'var(--font-display)',
        text: 'var(--font-text)',
      },

      // Font weights for display and text
      fontWeight: {
        display: 'var(--display-weight)',
        text: 'var(--text-weight)',
      },

      // Enhanced spacing scale for better hierarchy
      spacing: {
        '18': '4.5rem', // 72px
        '22': '5.5rem', // 88px
        '26': '6.5rem', // 104px
        '30': '7.5rem', // 120px
        '34': '8.5rem', // 136px
        '38': '9.5rem', // 152px
        '42': '10.5rem', // 168px
        '46': '11.5rem', // 184px
        '50': '12.5rem', // 200px
        '54': '13.5rem', // 216px
        '58': '14.5rem', // 232px
        '62': '15.5rem', // 248px
        '66': '16.5rem', // 264px
        '70': '17.5rem', // 280px
        '74': '18.5rem', // 296px
        '78': '19.5rem', // 312px
        '82': '20.5rem', // 328px
        '86': '21.5rem', // 344px
        '90': '22.5rem', // 360px
        '94': '23.5rem', // 376px
        '98': '24.5rem', // 392px
      },

      // Enhanced typography scale
      fontSize: {
        xs: ['var(--text-xs)', { lineHeight: 'var(--leading-tight)' }],
        sm: ['var(--text-sm)', { lineHeight: 'var(--leading-snug)' }],
        base: ['var(--text-base)', { lineHeight: 'var(--leading-normal)' }],
        lg: ['var(--text-lg)', { lineHeight: 'var(--leading-relaxed)' }],
        xl: ['var(--text-xl)', { lineHeight: 'var(--leading-relaxed)' }],
        '2xl': ['var(--text-2xl)', { lineHeight: 'var(--leading-tight)' }],
        '3xl': ['var(--text-3xl)', { lineHeight: 'var(--leading-tight)' }],
        '4xl': ['var(--text-4xl)', { lineHeight: 'var(--leading-tight)' }],
        '5xl': ['var(--text-5xl)', { lineHeight: 'var(--leading-tight)' }],
        '6xl': ['var(--text-6xl)', { lineHeight: 'var(--leading-tight)' }],
        '7xl': ['var(--text-7xl)', { lineHeight: 'var(--leading-tight)' }],
        '8xl': ['var(--text-8xl)', { lineHeight: 'var(--leading-tight)' }],
        '9xl': ['var(--text-9xl)', { lineHeight: 'var(--leading-tight)' }],
      },

      // Enhanced line heights
      lineHeight: {
        tight: 'var(--leading-tight)',
        snug: 'var(--leading-snug)',
        normal: 'var(--leading-normal)',
        relaxed: 'var(--leading-relaxed)',
        loose: 'var(--leading-loose)',
      },

      // Enhanced letter spacing
      letterSpacing: {
        tighter: 'var(--tracking-tighter)',
        tight: 'var(--tracking-tight)',
        normal: 'var(--tracking-normal)',
        wide: 'var(--tracking-wide)',
        wider: 'var(--tracking-wider)',
        widest: 'var(--tracking-widest)',
      },

      // Enhanced shadows for better depth
      boxShadow: {
        soft: '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        medium:
          '0 4px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        strong:
          '0 10px 40px -10px rgba(0, 0, 0, 0.15), 0 2px 10px -2px rgba(0, 0, 0, 0.05)',
        glow: '0 0 20px rgba(0, 25, 170, 0.15)',
        'glow-strong': '0 0 30px rgba(0, 25, 170, 0.25)',
      },

      // Enhanced animation utilities
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'bounce-gentle': 'bounceGentle 2s infinite',
        float: 'float 3s ease-in-out infinite',
        'pulse-gentle': 'pulseGentle 2s ease-in-out infinite',
      },

      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
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
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseGentle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
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

      // Backdrop blur for modern glass effect
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};

export default config;
