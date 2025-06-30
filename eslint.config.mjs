import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  ...compat.extends("prettier"),
  {
    rules: {
      // Add any custom rules for Veloz project
      '@typescript-eslint/no-unused-vars': 'warn',
      'prefer-const': 'warn',
    },
  },
  {
    // Allow require() imports in test files
    files: ["**/*.test.ts", "**/*.test.tsx", "**/__tests__/**/*.ts", "**/__tests__/**/*.tsx"],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-explicit-any': 'off', // Allow any in test files for mocking
    },
  },
  {
    // Allow explicit any in Firebase service files for complex error handling
    files: ["src/services/file-upload.ts", "src/lib/firebase-error-handler.ts"],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
];

export default eslintConfig;
