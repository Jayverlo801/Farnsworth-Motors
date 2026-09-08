import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Codex-owned 3D asset pipeline (Blender/Node tooling, not app code).
    "src/components/hero/three/pipeline/**",
    // Codex's working clone of this repository.
    "repo/**",
  ]),
]);

export default eslintConfig;
