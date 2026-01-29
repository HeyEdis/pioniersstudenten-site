This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## FYI

Nextjs gebruikt file based routing. Dus de naam van de volder in de /app map wordt de naam van de endpoint. In deze folder moet altijd een page.tsx file zitten en meot altijd page.tsx noemen

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

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

# Instructions for new devs

Install bun on Linux/Mac

```bash
curl -fsSL https://bun.com/install | bash
```

Extra step on Linux:

```bash
sudo apt install unzip
```

Install bun on Windows

```bash
powershell -c "irm bun.sh/install.ps1|iex"
```

Or install it with a package manager

```bash
npm install -g bun
```

Check bun version

```bash
bun --version
```

Create a project

```bash
bun create astro init
```

To install packages

```bash
bun install
```

Types toevoegen

```bash
bun add -d @types/bun
```

React toevoegen

```bash
bun astro add react
```

Bun gebruiken als runtime inplaats van NodeJS

```bash
bunx --bun astro dev
```

https://nextjs.org/docs/app/getting-started/layouts-and-pages