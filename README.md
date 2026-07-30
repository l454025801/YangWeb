# yangli.web

Personal site — React 19 + TypeScript + Tailwind v4, built with Vite.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # tsc -b && vite build -> dist/
npm run preview
```

## Where to edit

All copy, links, and slide definitions live in one file: [src/content.ts](src/content.ts). Nothing
else needs touching for a content change.

## Adding real images / video

Slides currently render procedural SVG figures as placeholders. To use a real asset, drop the file
in `public/media/` and add `src` to the slide:

```ts
{
  figure: 'plot',              // still required — used if src fails to load
  src: '/media/screening.mp4',
  kind: 'video',               // 'image' | 'video'
  caption: '...',
}
```

For the hero background, set `HERO_VIDEO` in [src/components/Hero.tsx](src/components/Hero.tsx) to a
path like `/media/hero.mp4`. Leave it `null` to keep the animated molecular field.

## Placeholders to replace

- Google Scholar URL in `PROFILE.links` is a guess — swap in the real profile link.
