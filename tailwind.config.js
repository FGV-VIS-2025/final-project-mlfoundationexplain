 /** @type {import('tailwindcss').Config} */
 export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {},
  },
  plugins: [],
}


module.exports = {
  darkMode: 'class', // ou 'media' se quiser seguir a preferência do sistema
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        background: 'var(--color-background)',
        'background-dark': 'var(--color-background_dark)',
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        accent: 'var(--color-accent)',
        text: 'var(--color-text)',
      }
    }
  },
  plugins: [],
}
