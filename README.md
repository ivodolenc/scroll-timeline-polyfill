# Scroll Timeline Base Polyfill

A TypeScript rewrite of a [`scroll-timeline-base.js`](https://github.com/flackr/scroll-timeline/blob/master/src/scroll-timeline-base.js) polyfill.

### Note

All features except the `ScrollTimeline` class itself have been removed from this polyfill to reduce the final bundle size as much as possible (esm min `~2.41kb`).

So this is just a JS base polyfill for scrolling in browsers that currently don't have built-in [`Scroll Timeline API`](https://developer.mozilla.org/en-US/docs/Web/API/ScrollTimeline).

## Usage

```ts
import { ScrollTimeline } from './dist/scroll-timeline-base.mjs'

// Start timeline
const timeline = new ScrollTimeline()

// Cancel timeline
timeline.cancel()
```

## Options

```ts
const timeline = new ScrollTimeline({
  source: document.documentElement,
  axis: 'y',
})
```

### source

- Type: `HTMLElement | null | undefined`
- Default: `document.documentElement`

### axis

- Type: `'y' | 'x' | undefined`
- Default: `'y'`

## Formats

- ESM, IIFE, UMD

## Bundle size

```txt
i Individual stats per module
i ├─ ./dist/scroll-timeline-base.mjs         esm │  54ms │ 5.13 KB
i ├─ ./dist/scroll-timeline-base.min.mjs     esm │  21ms │ 2.41 KB
i ├─ ./dist/scroll-timeline-base.iife.js    iife │  19ms │ 2.46 KB
i ├─ ./dist/scroll-timeline-base.umd.js      umd │  14ms │ 2.63 KB
i ├─ ./dist/types.d.ts                       dts │ 773ms │  1020 B
```

## License

Released under the [Apache-2.0](LICENSE.txt) license.
