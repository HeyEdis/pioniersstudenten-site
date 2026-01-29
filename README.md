# Getting Started

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

To install packages

```bash
bun install
```

Start application

```bash
bun dev
```

> If `--bun` is used in a script commando in `package.json` then bun is used as runtime instead of node!

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## FYI

Nextjs gebruikt file based routing. Dus de naam van de volder in de /app map wordt de naam van de endpoint. In deze folder moet altijd een page.tsx file zitten en moet altijd page.tsx noemen
