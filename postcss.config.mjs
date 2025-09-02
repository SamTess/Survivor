import tailwindcss from '@tailwindcss/postcss';

// Configuration PostCSS compatible Vite/Vitest.
// On fournit la fonction plugin plutôt qu'un simple nom de module (évite l'erreur "Invalid PostCSS Plugin").
const config = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};

export default config;
