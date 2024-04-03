# Scroll Timeline Base Polyfill

A TypeScript rewrite of a [`scroll-timeline-base.js`](https://github.com/flackr/scroll-timeline/blob/master/src/scroll-timeline-base.js) polyfill.

### Note

All features except the `ScrollTimeline` class itself have been removed from this polyfill to reduce the final bundle size as much as possible (esm min `~3.3kb`).

So this is just a JS base polyfill for scrolling in browsers that currently don't have built-in [`Scroll Timeline API`](https://developer.mozilla.org/en-US/docs/Web/API/ScrollTimeline).

## Usage

```ts
import { ScrollTimeline } from './dist/scroll-timeline-base.mjs'

// Start timeline
const timeline = new ScrollTimeline()

// Cancel timeline
timeline.cancel()
```

## Formats

- ESM, IIFE, UMD

## Bundle size

```txt
i Individual stats per module
i ├─ ./dist/scroll-timeline-base.mjs         esm │ 6.89 KB
i ├─ ./dist/scroll-timeline-base.min.mjs     esm │ 3.3 KB
i ├─ ./dist/scroll-timeline-base.iife.js    iife │ 3.35 KB
i ├─ ./dist/scroll-timeline-base.umd.js      umd │ 3.52 KB
```

## License

All credits go to the original [authors](https://github.com/flackr/scroll-timeline).

Released under the [Apache-2.0](LICENSE.txt) license.
