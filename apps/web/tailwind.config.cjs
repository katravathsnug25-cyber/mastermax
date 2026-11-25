module.exports = {
  darkMode: ['class'],
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1e3a8a',
        secondary: '#06b6d4',
        accent: '#8b5cf6',
        background: '#0f0f23',
        surface: '#1a1a2e',
        card: '#16213e',
        text: '#f8fafc',
        muted: '#64748b',
      },
    },
  },
};
