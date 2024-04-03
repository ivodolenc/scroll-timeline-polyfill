import { defineConfig } from '@hypernym/bundler'

export default defineConfig({
  entries: [
    {
      // esm
      input: './src/scroll-timeline-base.ts',
      output: './dist/scroll-timeline-base.mjs',
    },
    {
      // esm minified
      input: './src/scroll-timeline-base.ts',
      output: './dist/scroll-timeline-base.min.mjs',
      plugins: { esbuild: { minify: true } },
    },
    {
      // iife minified
      input: './src/scroll-timeline-base.ts',
      output: './dist/scroll-timeline-base.iife.js',
      plugins: { esbuild: { minify: true } },
      format: 'iife',
      name: 'ScrollTimelineBase',
    },
    {
      // umd minified
      input: './src/scroll-timeline-base.ts',
      output: './dist/scroll-timeline-base.umd.js',
      plugins: { esbuild: { minify: true } },
      format: 'umd',
      name: 'ScrollTimelineBase',
    },
  ],
})
