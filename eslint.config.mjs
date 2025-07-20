import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

// Theme-related rules to prevent hardcoded colors
const themeRules = {
  // Prevent hardcoded color classes
  'no-restricted-syntax': [
    'error',
    {
      selector: 'Literal[value=/^(bg|text|border)-(white|black|gray|blue|green|red|yellow|purple|pink|indigo)-(50|100|200|300|400|500|600|700|800|900)$/]',
      message: 'Use semantic theme variables instead of hardcoded colors. See docs/THEME.md for guidance.'
    }
  ],
  
  // Custom rule for className strings with hardcoded colors
  'no-restricted-properties': [
    'error',
    {
      object: 'className',
      property: 'includes',
      message: 'Avoid hardcoded colors in className. Use theme variables like bg-primary, text-foreground, etc.'
    }
  ],
};

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  ...compat.extends("prettier"),
  {
    rules: {
      // Add any custom rules for Veloz project
      '@typescript-eslint/no-unused-vars': 'warn',
      'prefer-const': 'warn',
      // Disable alt-text requirement for lucide-react icons
      'jsx-a11y/alt-text': ['warn', {
        'img': ['Image', 'img'],
        'components': ['Image'],
        'ignore': ['lucide-react']
      }],
      
      // Theme-related rules
      ...themeRules,
      
      // Custom rule for hardcoded color detection in strings
      'no-restricted-globals': [
        'error',
        {
          name: 'className',
          message: 'Use theme variables instead of hardcoded colors in className strings'
        }
      ],
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
  {
    // Allow className.includes in border-radius-utils.ts for legitimate border radius checking
    files: ["src/lib/border-radius-utils.ts"],
    rules: {
      'no-restricted-properties': 'off',
    },
  },
  {
    // Theme-specific rules for component files
    files: ["src/components/**/*.tsx", "src/app/**/*.tsx"],
    rules: {
      // Warn about hardcoded colors in component files
      'no-restricted-syntax': [
        'warn',
        {
          selector: 'TemplateLiteral[quasis.0.raw.raw=/.*(bg|text|border)-(white|black|gray|blue|green|red|yellow|purple|pink|indigo)-(50|100|200|300|400|500|600|700|800|900).*/]',
          message: 'Consider using theme variables instead of hardcoded colors. See docs/THEME.md for guidance.'
        }
      ],
    },
  },
];

export default eslintConfig;
