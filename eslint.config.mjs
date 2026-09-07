import js from '@eslint/js';
import globals from 'globals';

export default [
  { ignores: ['old/**'] },
  {
    ...js.configs.recommended,
    files: ['main.js', 'hero-texture.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'script',
      globals: globals.browser,
    },
  },
  {
    ...js.configs.recommended,
    files: ['tests/**/*.mjs', 'eslint.config.mjs'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: globals.node,
    },
  },
];
