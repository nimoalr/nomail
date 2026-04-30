# nomail

A minimalistic UI for managing disposable email aliases on Cloudflare Email Routing. Connect one or more Cloudflare zones, generate aliases with random suffixes, and forward everything to your real inbox.

This project is a fork of [x2.email](https://github.com/jessetinell/x2.email) by [Jesse Tinell](https://github.com/jessetinell). Thanks to him for the original work. This fork rebuilds the UI on shadcn/ui and adds multi-domain support, configurable random suffixes, dark mode and a refreshed design.

## Features

- **Multi-domain.** Connect multiple Cloudflare accounts and zones, switch between them from the header, or view aliases across all of them at once.
- **Unguessable aliases.** Every new alias gets a random suffix (`service-a1b2c3@yourdomain.com`) so a leaked address can be revoked without losing the service name. Suffix length is configurable from 3 to 10 characters.
- **Search.** Quick text search across alias, destination and domain.
- **Light / dark / system theme.** `next-themes` with shadcn neutral palette and a purple accent.
- **No backend.** Credentials are encrypted and stored locally in your browser. No accounts, no database, no analytics.
- **Talks to Cloudflare directly** through a thin proxy that forwards requests verbatim to the Cloudflare API.

## Tech stack

- Next.js 16 (App Router)
- React 19 + TypeScript
- Tailwind CSS v4
- shadcn/ui (built on [Base UI](https://base-ui.com))
- lucide-react, sonner, next-themes
- Cloudflare Email Routing API

## Getting started

### Prerequisites

1. A Cloudflare account
2. A domain connected to Cloudflare with [Email Routing](https://developers.cloudflare.com/email-routing/) enabled
3. A Cloudflare API token with the following permissions:
   - **Account** → Email Routing Addresses → Read
   - **Zone** → Email Routing Rules → Edit
   - **Zone** → Zone Settings → Read

### Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and paste your Account ID, Zone ID and API token. Both regular and "Quick auth" (comma-separated) entry are supported.

### Deploy

The app is a standard Next.js 16 project, deployable on any Next.js host.

For Cloudflare Workers, the repo ships with [`@opennextjs/cloudflare`](https://opennext.js.org/cloudflare). Hook the GitHub repo to Cloudflare Workers Builds and use:

- **Build command**: `npx opennextjs-cloudflare build`
- **Deploy command**: `npx opennextjs-cloudflare deploy`

Or run `npm run deploy` locally after `npx wrangler login`.

## Project layout

```
src/
├── app/                 Next.js routes (login, /app, /faq, /settings, /login/cloudflare)
├── components/          App components (Header, Footer, AliasDialog, ...)
│   └── ui/              shadcn primitives
├── context/             React contexts (User, Cloudflare, Settings)
├── services/cloudflare/ Cloudflare API client + types
└── utils/               Encryption helpers and shared utilities
```

## Contributing

Issues and PRs welcome. Run `npx tsc --noEmit` before opening a PR.

## License

MIT, same as the upstream project.
