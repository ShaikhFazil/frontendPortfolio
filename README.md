# Fazil Shaikh | Portfolio Frontend

Next.js 14 (App Router) portfolio with a private admin dashboard. The public site is
server rendered from the backend API; the dashboard at `/dashboard` edits that content
without touching code or the database.

---

## Quick start

```bash
cp .env.example .env.local
npm install
npm run dev            # http://localhost:3000
```

Start the backend first (see `portfolio-backend/README.md`), otherwise the site renders
from its bundled fallback content.

---

## Environment

| Variable | Default | Notes |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:5000/api` | Backend base URL, no trailing slash. |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` | Used for canonical tags, Open Graph and the sitemap. |
| `NEXT_PUBLIC_REVALIDATE` | `60` | Seconds a cached page stays fresh. |

---

## Routes

| Route | What it is |
|---|---|
| `/` | Public portfolio: hero, about, skills, experience, work, education, resume, contact |
| `/work/[slug]` | Project detail page, statically generated per project |
| `/dashboard/login` | Admin sign in |
| `/dashboard` | Overview with live counts from the database |
| `/dashboard/profile` | Name, title, summary, bio, contact details, socials, profile photo |
| `/dashboard/skills` | Skills by category, featured flag, ordering |
| `/dashboard/experience` | Roles, achievements, technologies, company logos |
| `/dashboard/projects` | Projects, thumbnails, screenshot galleries, links, featured flag |
| `/dashboard/education` | Degrees and diplomas |
| `/dashboard/certifications` | Certifications and achievements |
| `/dashboard/resume` | Upload, preview, activate, download and delete resume versions |
| `/dashboard/messages` | Contact form submissions, read/archive/delete |
| `/dashboard/settings` | Change your admin password |

`/dashboard` is excluded in `robots.ts` and sent with `X-Robots-Tag: noindex`.

---

## How content flows

1. The homepage calls `GET /api/portfolio` once, on the server, with
   `next: { revalidate: 60, tags: ['portfolio'] }`.
2. Next caches the rendered HTML and revalidates it in the background, so an edit in the
   dashboard appears on the public site within about a minute with no redeploy.
3. If the API cannot be reached, `lib/fallback.ts` supplies bundled content built from the
   resume, so the page is never blank and never drops out of the index. The resume button
   then serves `/public/imgs/FAZIL_SHAIKH_RESUME.pdf`.

To make edits appear instantly instead of within the revalidate window, lower
`NEXT_PUBLIC_REVALIDATE`, or add an on-demand revalidation route that calls
`revalidateTag('portfolio')` and have the backend ping it after each write.

---

## Design notes

- Dark theme throughout, with the violet accent carried over from the previous build.
- Fonts are **self-hosted** variable woff2 files in `app/fonts` (Space Grotesk for
  headings, Manrope for body, Fira Code for mono), loaded through `next/font/local`.
  Nothing is requested from Google at runtime.
- `components/sections/code-typing.tsx` is the animated code panel from the previous
  portfolio, **kept byte for byte**. It is the signature of the hero and was deliberately
  not touched. To change the skills it types out, edit the `codeSnippet` string at the top
  of that file.
- Motion comes from Framer Motion and is limited to entry and scroll reveals. Everything
  collapses to static under `prefers-reduced-motion`.
- Projects without an uploaded screenshot render as text-only cards rather than a mocked
  up browser frame. Upload thumbnails from the dashboard and the cards switch to images.

---

## Structure

```
app/
  (site)/            public site: layout, homepage, /work/[slug]
  dashboard/
    layout.tsx       AuthProvider
    login/           sign in, outside the panel shell
    (panel)/         shell + every admin page
  fonts/             self-hosted woff2 files
  layout.tsx         root layout, fonts, metadata, toaster
  globals.css        design tokens and component classes
  robots.ts, sitemap.ts, not-found.tsx
components/
  sections/          hero, about, skills, experience, projects, education,
                     resume band, contact, tech marquee, code-typing (preserved)
  site/              navbar, footer, section heading, scroll reveal
  dashboard/         auth context, shell, resource manager, image upload
  ui/                button, form fields, badges, skeletons, dialogs
lib/
  api.ts             server-side fetching with caching and fallback
  client-api.ts      browser client, cookie based, upload validation
  fallback.ts        bundled content used when the API is unreachable
  types.ts           shared types
data/fallback.json   mirror of the backend seed data
```

Five dashboard pages (skills, experience, projects, education, certifications) are thin
configs over one `ResourceManager` component, so they share list, search, filters, create,
edit, reorder, publish toggle, delete confirmation and all their loading, empty and error
states.

---

## SEO and performance

- Server rendered with background revalidation, so the main content is in the HTML.
- Per-page metadata, canonical URLs, Open Graph and Twitter cards.
- `Person` JSON-LD on the homepage, built from the same data the page renders.
- `sitemap.xml` generated from live projects; `robots.txt` excludes the dashboard.
- `next/image` with explicit dimensions and Cloudinary in `remotePatterns`.
- Self-hosted fonts with `display: swap` and no layout shift.
- Skip link, visible focus rings, labelled form controls, `aria-current` in the nav.

---

## Manual verification checklist

Automated tests here are limited to the type check and production build. With both apps
running, these are the flows worth clicking through once:

- [ ] Sign in at `/dashboard/login`, then confirm `/dashboard` shows real counts
- [ ] Edit the profile, reload `/`, confirm the hero and about section changed
- [ ] Create a project, mark it featured, confirm it appears on `/` and at `/work/<slug>`
- [ ] Upload a project thumbnail and confirm the card switches to the image
- [ ] Reorder skills, confirm the public order matches
- [ ] Upload a resume PDF, confirm every Download button serves the new file
- [ ] Upload a second resume, activate the first, confirm the site follows
- [ ] Submit the contact form, confirm it lands in `/dashboard/messages`
- [ ] Sign out, then call `PUT /api/profile` with curl and confirm it returns 401

---

## Scripts

```bash
npm run dev     # development server
npm run build   # production build
npm run start   # serve the production build
npm run lint    # eslint
```

`npm run build` reports one ESLint warning, an exhaustive-deps hint inside
`code-typing.tsx`. That file is preserved unchanged on purpose, so the warning is left
in place rather than papered over.

---

## Deployment

Vercel is the straightforward option:

1. Push this folder to a repository and import it.
2. Set `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SITE_URL` and `NEXT_PUBLIC_REVALIDATE`.
3. Deploy, then set `FRONTEND_URL` on the backend to the deployed origin.
4. If the API sits on a different domain, set `COOKIE_CROSS_SITE=true` on the backend.
   Both sides must be HTTPS or the browser will drop the admin cookie.

Any Node host works too: `npm ci && npm run build && npm run start`.
