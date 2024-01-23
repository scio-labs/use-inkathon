import { defineConfig } from 'tsup'

export default defineConfig((options) => {
  return {
    entry: [
      'src/index.ts',
      'src/chains.ts',
      'src/wallets.ts',
      'src/helpers/index.ts',
      'src/hooks/index.ts',
      'src/types/index.ts',
    ],
    splitting: true,
    sourcemap: true,
    clean: true,
    minify: !options.watch,
    treeshake: true,
    dts: true,
    format: ['esm'],
    external: ['react'],
  }
})
