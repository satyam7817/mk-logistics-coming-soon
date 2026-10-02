# MK Logistics — Coming Soon

A standalone React + Vite coming-soon page for MK Logistics.

## Page

**Something New Comming Soon**

Countdown target:

**8 November 2026 · 7:00 PM IST (GMT+05:30)**

The countdown is calculated from the visitor's current time against the fixed UTC+05:30 launch timestamp.

## Background

The page uses the same `OceanBackground` implementation as the MK Logistics admin login, including its WebGPU ocean/particle rendering and WebGL fallback.

## Local development

Requirements:

- Node.js 22+
- pnpm 11+

```bash
pnpm install
pnpm dev
```

Build:

```bash
pnpm build
```

Preview the production build:

```bash
pnpm preview
```

## GitHub Pages

This repository includes a GitHub Actions workflow at:

`.github/workflows/deploy.yml`

Push the repository to GitHub, then enable **GitHub Actions** as the Pages source in the repository's Pages settings. The workflow builds `dist/` and deploys it to GitHub Pages.

The Vite base is set to `./`, so the generated site works under a repository path as well as a custom domain.

## Changing the launch date

The launch timestamp is defined in `src/App.tsx`:

```ts
const TARGET_TIME = new Date("2026-11-08T19:00:00+05:30").getTime();
```

Keep the `+05:30` offset if the intended launch time is 7:00 PM India Standard Time.
