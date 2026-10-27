import js from "@eslint/js";
import globals from "globals";
import pluginReact from "eslint-plugin-react";

export default [
  {
    ignores: ["build/**", "dist/**"],
  },
  js.configs.recommended,
  {
    files: ["**/*.{js,mjs,cjs,jsx}"],
    plugins: {
      react: pluginReact,
    },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.jest,
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      "react/react-in-jsx-scope": "off",
      "react/jsx-uses-vars": "error",
      "semi": ["error", "always"],
      "quotes": ["error", "double"],
      "no-unused-vars": ["warn", { "varsIgnorePattern": "^[A-Z]" }],
      "no-console": "off",
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },
];