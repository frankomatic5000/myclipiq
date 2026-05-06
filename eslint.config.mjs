import nextPlugin from "eslint-config-next";
import tseslint from "typescript-eslint";

const eslintConfig = [
  ...nextPlugin,
  ...tseslint.configs.recommended,
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
];

export default eslintConfig;
