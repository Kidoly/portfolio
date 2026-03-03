# Portfolio & Blog — Alban Mary

My personal portfolio and blog, built with Next.js 16 and Tailwind CSS.  
The blog pulls articles from a Wiki.js instance and turns them into proper SEO-friendly posts.

Live at **[albanmary.com](https://albanmary.com)**

## Tech stack

- **Next.js 16** (App Router, React 19)
- **TypeScript**
- **Tailwind CSS v4**
- Markdown rendering with syntax highlighting (rehype-highlight)
- Wiki.js sync via GraphQL API
- JWT auth for admin panel

## Features

- Bilingual portfolio (FR / EN)
- Blog with article listing, search, filtering by tags/categories
- Admin panel to create, edit and manage blog posts
- Wiki.js integration — sync articles directly from your wiki
- Auto-generation of metadata (tags, description, SEO) with local analysis or OpenAI
- Markdown support with code blocks, Wiki.js callouts, images
- SEO optimized (JSON-LD, Open Graph, dynamic sitemap)
- Contact form with email sending
- Docker ready

## Getting started

Clone the repo, install deps and run:

```bash
npm install
npm run dev
```

This starts both the Next.js dev server and the email backend (via concurrently).  
App runs on [http://localhost:3000](http://localhost:3000).

## Environment variables

Copy `.env.example` to `.env.local` and fill in the values:

```
WIKI_API_URL=http://your-wikijs-instance.com
WIKI_API_KEY=your-wiki-api-key
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=           # see .env.example for how to generate
ADMIN_JWT_SECRET=some-random-string
OPENAI_API_KEY=                # optional, for AI metadata generation
```

## Admin panel

Go to `/admin` and log in. From there you can:

- Create / edit / delete blog posts
- Toggle publish status
- Sync articles from Wiki.js
- Auto-generate tags, description and SEO fields

> Default credentials in dev: `admin` / `admin` (no password hash needed)

## Build & deploy

```bash
npm run build
npm start
```

Or with Docker:

```bash
docker build -t portfolio .
docker run -p 3000:3000 portfolio
```

## Project structure

```
src/
├── app/
│   ├── blog/           # Public blog pages
│   ├── admin/          # Admin panel (login, posts, sync)
│   └── api/            # API routes (auth, posts, sync, preview, generate)
├── components/         # Portfolio + admin components
├── contexts/           # Language context (i18n)
└── lib/
    └── blog/           # Blog logic (posts, markdown, wiki-sync, auth, auto-generate)
content/
└── blog/               # JSON storage for blog posts
```

## License

This is a personal project, feel free to take inspiration but please don't copy it as-is 👍
