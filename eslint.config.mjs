import Module from 'node:module';
import { defineConfig, globalIgnores } from 'eslint/config';

// `next lint` is gone since Next 16, so ESLint runs directly with Next's flat configs.
// typescript-eslint does not support TypeScript 7 (the Go compiler used by the project) yet:
// its packages get TypeScript 6 (devDependency alias `typescript6`) instead. Remove this hook
// once typescript-eslint accepts TypeScript 7.
const typescript6 = Module.createRequire(import.meta.url).resolve('typescript6');
const TS_ESLINT = /[\\/]node_modules[\\/](@typescript-eslint|typescript-eslint|ts-api-utils)[\\/]/;
const resolveFilename = Module._resolveFilename;
Module._resolveFilename = function (request, parent, ...rest) {
  if (request === 'typescript' && TS_ESLINT.test(parent?.filename ?? '')) return typescript6;
  return resolveFilename.call(this, request, parent, ...rest);
};

const { default: nextVitals } = await import('eslint-config-next/core-web-vitals');
const { default: nextTs } = await import('eslint-config-next/typescript');

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  // eslint-plugin-react's version detection calls context.getFilename(), removed in ESLint 10
  { settings: { react: { version: '19.2' } } },
  // `const { content, ...meta } = post` is how fields are left out
  { rules: { '@typescript-eslint/no-unused-vars': ['warn', { ignoreRestSiblings: true }] } },
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts']),
]);
