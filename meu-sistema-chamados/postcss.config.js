// 1. Importar AMBOS os plugins
import tailwindcss from '@tailwindcss/postcss';
import autoprefixer from 'autoprefixer';

export default {
  plugins: [
    // 2. Chamar AMBOS como funções
    tailwindcss(),
    autoprefixer(),
  ],
}

