/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Tokens compartilhados com o ecossistema OTTO
        'otto-primary':  '#1D9E75',
        'otto-dark':     '#0F6E56',
        'otto-light':    '#E8F7F2',
        'otto-bg':       '#F8FAFA',
        'otto-surface':  '#FFFFFF',
        'otto-border':   '#D1EAE3',
        'otto-muted':    '#6B8E83',
        'otto-text':     '#1A2E2A',
        // Tokens locais — paleta inspirada em "via aérea"
        'aerodig-airway':   '#0E7AB8',  // azul-traqueia (procedimentos)
        'aerodig-frontier': '#7C3AED',  // roxo (radar de fronteira)
        'aerodig-news':     '#F59E0B',  // âmbar (news)
        'aerodig-event':    '#10B981',  // verde (eventos)
        'aerodig-flag':     '#EF4444',  // vermelho (red flags)
        'aerodig-soft':     '#EFF6FB',  // fundo clarinho aerodig
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
