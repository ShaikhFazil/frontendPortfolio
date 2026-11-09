# =============================================================================
# Frontend image — Next.js 14 (App Router) in standalone mode
#
# Three stages. Only the last one ends up in the final image, so the compiler,
# the dev dependencies and the source code are all left behind.
#
#   deps    -> install every dependency (including dev) so Next can build
#   builder -> run `next build`, producing .next/standalone
#   runner  -> copy only the built output and run it
# =============================================================================

# ----------------------------------------------------------------------------
# Stage 1: deps — install node modules
# ----------------------------------------------------------------------------
# "alpine" is a tiny Linux base (~5MB). The exact Node version is pinned so the
# image you build in six months is the same one you build today.
FROM node:20.18-alpine AS deps

# Next.js uses the `sharp` library for image optimisation. On Alpine it needs
# libc6-compat present, otherwise it fails at runtime with a linker error.
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy ONLY the manifests first. Docker caches each layer, and a layer is
# rebuilt only when its inputs change. Because package.json changes far less
# often than your components do, this means editing a React file does not
# re-download every dependency — the install layer is reused.
COPY package.json package-lock.json ./

# `npm ci` ("clean install") installs the exact versions pinned in
# package-lock.json and fails if the lockfile disagrees with package.json.
# `npm install` would silently upgrade packages. In a build pipeline you always
# want ci, so that every build is reproducible.
RUN npm ci

# ----------------------------------------------------------------------------
# Stage 2: builder — compile the app
# ----------------------------------------------------------------------------
FROM node:20.18-alpine AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app

# ===== THE MOST IMPORTANT PART OF THIS FILE =====
#
# Any variable whose name starts with NEXT_PUBLIC_ is NOT read when the
# container starts. `next build` finds every mention of it in your code and
# replaces it with a literal string, which is then shipped inside the
# JavaScript the browser downloads.
#
# So setting NEXT_PUBLIC_API_URL in docker-compose has NO EFFECT on browser
# code. It must be passed in HERE, at build time, as a build argument.
#
# Get this wrong and the symptom is: the site loads, but the contact form and
# the whole dashboard fail, and your browser console shows requests going to
# http://localhost:5000 — the default baked in from lib/client-api.ts.
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_REVALIDATE=60

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_REVALIDATE=$NEXT_PUBLIC_REVALIDATE

# Turn off Next's anonymous usage reporting inside CI.
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Reuse the node_modules from stage 1 instead of installing again.
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build. Two things to know about what happens here:
#
#  1. Your pages use `export const revalidate = 60` (ISR), and
#     app/(site)/work/[slug]/page.tsx calls generateStaticParams(). Next will
#     therefore try to reach the API during the build to pre-render pages.
#
#  2. During a CI build the API is NOT reachable. That is fine and expected:
#     lib/api.ts catches the failure and returns the bundled content from
#     data/fallback.json, so the build succeeds. Those pages are then
#     regenerated with live data within 60 seconds of the first real visit.
RUN npm run build

# ----------------------------------------------------------------------------
# Stage 3: runner — the only stage that ships
# ----------------------------------------------------------------------------
FROM node:20.18-alpine AS runner
RUN apk add --no-cache libc6-compat
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
# Listen on every interface. The default would be 127.0.0.1, which inside a
# container means "only reachable from inside this container" — Nginx would
# get connection refused and you would see 502 Bad Gateway.
ENV HOSTNAME=0.0.0.0

# Run as a non-root user. If anyone ever breaks out of the Node process, they
# land as an unprivileged user instead of root. The node:alpine image already
# ships a `node` user with uid 1000, so we reuse it.
#
# .next/cache must be writable and owned by that user: this app uses ISR, and
# ISR writes regenerated pages into .next/cache at runtime. If the directory is
# root-owned, every revalidation fails with EACCES and the site silently keeps
# serving stale fallback content.
RUN mkdir -p .next/cache && chown -R node:node /app

# `output: 'standalone'` produced .next/standalone — the server plus a minimal
# node_modules containing only what is actually imported. Copy that, and the two
# directories Next deliberately leaves out of it:
#   public/        your images, resume PDF and skill icons
#   .next/static/  the hashed JS and CSS bundles
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/.next/static ./.next/static

USER node

EXPOSE 3000

# Docker runs this every 30s and marks the container unhealthy after 3 failures.
# docker-compose uses that status to decide when the container is really ready,
# and the deploy script uses it to decide whether to roll back.
# The standalone image has no curl, so we use Node itself.
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

# server.js is generated by the standalone build. Note there is no `npm start`
# and no `next` binary here — that is the whole point of standalone mode.
CMD ["node", "server.js"]
