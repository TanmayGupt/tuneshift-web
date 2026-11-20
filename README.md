# TuneShift Web ("Your music. Anywhere.")

TuneShift is a client-side React + TypeScript + Vite web application for importing, cleaning, matching, reviewing, and exporting playlists across **Spotify**, **YouTube Music**, **Apple Music**, **Deezer**, and **Universal CSV / Text**.

## Local Development

```bash
npm install
npm test
npm run dev
```

## Production Build

```bash
npm install
npm run build
```

This runs TypeScript type-checking (`tsc -b`) and bundles the static site into `dist/`.

## Deploying to Cloudflare Pages

1. Push the project (or upload `dist/`) to Cloudflare Pages:
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Node version (if needed):** `20` or `22`
2. `public/_redirects` (`/* /index.html 200`) is included so direct links to `/workspace`, `/import`, `/preview`, `/matching`, `/unmatched`, `/summary`, `/faq`, and `/privacy` resolve cleanly on Cloudflare Pages.
3. For Direct Upload (`wrangler` or dashboard drag-and-drop): run `npm run build` and upload the generated `dist/` folder.

## Privacy & Platform Integration Notes

- All CSV parsing, track matching, and export generation run locally in the browser.
- Active sessions, saved playlists, and export history are stored in `localStorage` and can be cleared anytime from `/privacy`.
- Direct OAuth playlist read/write requires platform developer credentials and a server-side token broker (such as a Cloudflare Worker) and is intentionally not fabricated in the frontend.
