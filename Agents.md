# Agents Guide

## Project Overview

Pixelate_Filter is a Vue 3 + Vite web app for turning uploaded or camera-captured
images into pixel art with Canvas. It supports block-size control, color-depth
quantization, built-in palettes, custom palettes, local history, camera capture,
and image export.

## Tech Stack

- Vue 3 single-file components with `<script setup lang="ts">`.
- Vite for local development, preview, and production builds.
- TypeScript in strict mode.
- Canvas 2D APIs for image processing.
- `lucide-vue-next` for UI icons.
- Browser `localStorage` for history persistence.
- Browser `getUserMedia` for camera capture.

## Important Commands

- Install dependencies: `npm install`
- Start dev server: `npm run dev`
- Type-check only: `npm run typecheck`
- Build production bundle: `npm run build`
- Preview production build: `npm run preview`
- Project test command: `npm test`

The dev and preview servers use port `1212` and bind to `0.0.0.0`.

## Repository Layout

- `src/main.ts` mounts the Vue app.
- `src/App.vue` contains the primary application UI and orchestration state.
- `src/styles.css` contains the global application styling.
- `src/lib/pixelate.ts` owns Canvas pixelation, quantization, thumbnailing, and
  export scaling helpers.
- `src/lib/palettes.ts` defines palette types, built-in palettes, color parsing,
  and CSS color formatting helpers.
- `src/lib/history.ts` owns local history records in `localStorage`.
- `src/lib/camera.ts` wraps camera start, stop, switch, and capture behavior.
- `document/` contains product and onboarding documentation.
- `docker/`, `Dockerfile`, and `docker-compose.yml` support containerized
  deployment.
- `dist/` is generated build output.

## Coding Guidelines

- Keep changes scoped to the feature or bug being addressed.
- Prefer existing Vue Composition API patterns from `src/App.vue`.
- Keep shared behavior in `src/lib/*` when it can be tested or reasoned about
  independently from the UI.
- Preserve strict TypeScript compatibility. The project enables
  `noUnusedLocals`, `noUnusedParameters`, and `noFallthroughCasesInSwitch`.
- Use `lucide-vue-next` icons for new icon buttons or tool actions.
- When working with Canvas, keep `imageSmoothingEnabled = false` for pixel-art
  output unless a feature explicitly needs smoothing.
- Treat browser APIs defensively: camera, localStorage, Blob export, and Canvas
  contexts can fail or be unavailable.
- Do not edit `node_modules/` or `dist/` by hand.
- Do not change Docker, Vercel, or build configuration unless the task requires
  deployment or infrastructure changes.

## UI Notes

- The app is a direct-use tool, not a marketing page. Keep the first usable app
  workflow fast and obvious.
- Maintain accessible labels, button titles, and disabled states for actions
  that require an uploaded image or generated result.
- For new controls, prefer native inputs where they fit: range sliders for
  numeric values, segmented buttons for compact option sets, and color inputs
  for color selection.
- Validate uploads consistently with the existing supported formats and maximum
  file size before reading files.

## Verification

Before handing off code changes, run:

```bash
npm run build
```

For UI changes, also run the dev server with:

```bash
npm run dev
```

Then verify the app in a browser at `http://localhost:1212`.

## Notes For Future Agents

- There is currently no dedicated unit-test suite. `npm test` delegates to the
  production build, so build failures are the main automated signal.
- Image-processing changes should be checked with at least one uploaded image and
  one export format.
- Camera changes require browser permission and should degrade gracefully when a
  camera is unavailable.
- History changes should preserve the `pixelate_filter_history` storage key
  unless there is a migration plan.
