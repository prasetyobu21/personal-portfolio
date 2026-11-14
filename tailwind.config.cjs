module.exports = {
  content: ['./src/**/*.{astro,html,js}'],
  theme: {
    extend: {
      colors: {
        primary: '#F3F3EF',
        muted: '#A7A7A2',
        bg: '#101110',
        surface: '#191A18',
        'card-border': '#2B2C29',
      },
      fontFamily: { sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'] },
    },
  },
};
