# Prasetyo's portfolio

A static Astro portfolio preserving the original design, animated introduction,
category filters, and image lightbox. Tailwind CSS is compiled at build time.

## Development

Use Node.js 22 or newer.

```sh
npm install
npm run dev
```

## Checks and production

```sh
npm run check
npm test
npm run preview
```

`npm test` builds the site and runs regression checks. Deploy the generated `dist/`
directory to any static host. Configure the host to run `npm run build` and publish
`dist` instead of serving the repository root.

## Content

- Edit portfolio projects in `src/data/projects.json`.
- Edit the bio and contact links in `src/components/Hero.astro` and `Footer.astro`.
- Images live in `public/assets/images`; their public URLs remain `assets/images/...`.
- Shared styling lives in `src/styles/global.css` and `tailwind.config.cjs`.
- Browser interactions live in `src/scripts/portfolio.js`.

The optional image conversion scripts still preserve originals; run them from the
project root. The Python script requires Pillow. Google Fonts needs a network
connection; system fonts provide a fallback.

## Project case studies

Preview `/project/template` for a case-study template in the portfolio's visual style.
It uses existing Retain AI images and clearly marked sample copy; replace the prompts
with your own story and verified results before publishing.

To create a case study, copy `src/pages/project/template.md` to
`src/pages/project/your-project.md`. Edit its frontmatter for the title, summary,
cover, project details, and section navigation, then write the story in Markdown.
Keep each navigation ID in sync with its heading (for example, `The problem`
becomes `the-problem`). Use `/assets/images/...` image paths so they work on nested
pages. Remove `template: true` when the content is ready.

`src/layouts/ProjectLayout.astro` supplies the shared case-study design, responsive
section navigation, and contact footer. Project pages open directly without the
homepage loading animation. To link a finished case study from the homepage, update
the relevant project's `href` in `src/data/projects.json`.
