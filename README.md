This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [https://instagram-like-and-follow-booster.vercel.app/login](https://instagram-like-and-follow-booster.vercel.app/login) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Supabase setup

1. Copy `.env.local.example` to `.env.local` and fill in your Supabase project values:

```bash
cp .env.local.example .env.local
```

2. Run the dev server and hit the health endpoint to verify the connection:

- Visit: `http://localhost:3000/api/health`

If Supabase is connected and the `users` table exists, you should see a JSON response like:

```json
{ "ok": true, "message": "Supabase connected (users table query succeeded)" }
```

If it fails, check your environment variables and ensure your Supabase project has the schema from `supabase/migrations/000_initial_schema.sql` applied.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
