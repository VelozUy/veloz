import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Veloz Brand Colors - Elegance & Warmth
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        muted: 'var(--muted)',
        border: 'var(--border)',
        
        // Primary brand colors
        primary: {
          50: '#f8f9fa',
          100: '#f1f3f4',
          500: '#2c3e50', // Deep blue-grey for elegance
          600: '#34495e',
          900: '#1a252f',
          DEFAULT: 'var(--primary)',
        },
        
        // Secondary warm colors
        secondary: {
          50: '#fdf6f0',
          100: '#fbeee0',
          500: '#d4a574', // Warm gold for warmth
          600: '#c8975f',
          900: '#8b6914',
          DEFAULT: 'var(--secondary)',
        },
        
        // Accent colors for boldness
        accent: {
          50: '#fff7ed',
          100: '#ffedd5',
          500: '#f97316', // Bold orange
          600: '#ea580c',
          900: '#9a3412',
        },
        
        // Neutral grays for effectiveness
        neutral: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        },
      },
      
      // Typography for elegance
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
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
      
      // Border radius for modern look
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      
      // Box shadows for depth
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'elegant': '0 4px 25px -2px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        'warm': '0 10px 25px -5px rgba(212, 165, 116, 0.25), 0 8px 10px -6px rgba(212, 165, 116, 0.1)',
      },
      
      // Backdrop blur for modern glass effect
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}

export default config 