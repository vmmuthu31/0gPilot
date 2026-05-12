import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "src/chains/typechain-types/**",
    "src/chains/artifacts/**",
    "src/chains/cache/**",
    "src/generated/**",
    "generated/**",
  ]),
]);

export default eslintConfig;
