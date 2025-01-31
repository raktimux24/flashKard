/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      backgroundImage: {
        'dot-pattern': `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 800'%3E%3Cg stroke-width='3.5' stroke='hsla(0, 0%25, 100%25, 1.00)' fill='none'%3E%3Ccircle r='4.29' cx='0' cy='0' fill='hsla(0, 0%25, 100%25, 1.00)' stroke='none'/%3E%3Ccircle r='4.29' cx='400' cy='0' fill='hsla(0, 0%25, 100%25, 1.00)' stroke='none'/%3E%3Ccircle r='4.29' cx='800' cy='0' fill='hsla(0, 0%25, 100%25, 1.00)' stroke='none'/%3E%3Ccircle r='4.29' cx='0' cy='400' fill='hsla(0, 0%25, 100%25, 1.00)' stroke='none'/%3E%3Ccircle r='4.29' cx='400' cy='400' fill='hsla(0, 0%25, 100%25, 1.00)' stroke='none'/%3E%3Ccircle r='4.29' cx='800' cy='400' fill='hsla(0, 0%25, 100%25, 1.00)' stroke='none'/%3E%3Ccircle r='4.29' cx='0' cy='800' fill='hsla(0, 0%25, 100%25, 1.00)' stroke='none'/%3E%3Ccircle r='4.29' cx='400' cy='800' fill='hsla(0, 0%25, 100%25, 1.00)' stroke='none'/%3E%3Ccircle r='4.29' cx='800' cy='800' fill='hsla(0, 0%25, 100%25, 1.00)' stroke='none'/%3E%3C/g%3E%3C/svg%3E")`,
        'dot-pattern-light': `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 800'%3E%3Cg stroke-width='3.5' stroke='hsla(215, 16%25, 47%25, 1.00)' fill='none'%3E%3Ccircle r='4.29' cx='0' cy='0' fill='hsla(215, 16%25, 47%25, 1.00)' stroke='none'/%3E%3Ccircle r='4.29' cx='400' cy='0' fill='hsla(215, 16%25, 47%25, 1.00)' stroke='none'/%3E%3Ccircle r='4.29' cx='800' cy='0' fill='hsla(215, 16%25, 47%25, 1.00)' stroke='none'/%3E%3Ccircle r='4.29' cx='0' cy='400' fill='hsla(215, 16%25, 47%25, 1.00)' stroke='none'/%3E%3Ccircle r='4.29' cx='400' cy='400' fill='hsla(215, 16%25, 47%25, 1.00)' stroke='none'/%3E%3Ccircle r='4.29' cx='800' cy='400' fill='hsla(215, 16%25, 47%25, 1.00)' stroke='none'/%3E%3Ccircle r='4.29' cx='0' cy='800' fill='hsla(215, 16%25, 47%25, 1.00)' stroke='none'/%3E%3Ccircle r='4.29' cx='400' cy='800' fill='hsla(215, 16%25, 47%25, 1.00)' stroke='none'/%3E%3Ccircle r='4.29' cx='800' cy='800' fill='hsla(215, 16%25, 47%25, 1.00)' stroke='none'/%3E%3C/g%3E%3C/svg%3E")`,
      },
      maxWidth: {
        container: "1280px",
      },
      animation: {
        marquee: 'marquee var(--duration) linear infinite',
      },
      keyframes: {
        marquee: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(calc(-100% - var(--gap)))' }
        }
      },
      colors: {
        border: '#2A2A2A',
        background: '#121212',
        foreground: '#EAEAEA',
        primary: '#00A6B2',
        'primary-foreground': '#FFFFFF',
        card: '#2A2A2A',
        'card-foreground': '#EAEAEA',
        muted: '#404040',
        'muted-foreground': '#C0C0C0',
        accent: '#2A2A2A',
        'accent-foreground': '#EAEAEA',
        destructive: '#FF0000',
        'destructive-foreground': '#FFFFFF',
        ring: '#00A6B2',
      }
    },
  },
  plugins: [],
};