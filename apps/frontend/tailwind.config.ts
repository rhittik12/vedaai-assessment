import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#050816',
          900: '#0a1024',
          800: '#10193a'
        },
        accent: {
          400: '#7dd3fc',
          500: '#38bdf8',
          600: '#0ea5e9'
        }
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(125, 211, 252, 0.18), 0 24px 80px rgba(56, 189, 248, 0.18)'
      }
    }
  },
  plugins: []
};

export default config;