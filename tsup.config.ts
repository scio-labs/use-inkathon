import { defineConfig } from 'tsup'

export default defineConfig((options) => {
  return {
    entry: ['src/index.ts'],
    splitting: false,
    sourcemap: true,
    clean: true,
    minify: !options.watch,
    treeshake: true,
    dts: true,
    format: ['esm'],
    external: ['react'],
  }
})
