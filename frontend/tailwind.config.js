module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        terminal: '#0d0d0d',
        surface: '#141414',
        border: '#2a2a2a',
        amber: '#EF9F27',
        positive: '#1D9E75',
        negative: '#E24B4A',
        muted: '#666666',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};
