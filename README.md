# Getting Started

## Technologies & Packages Used

- [Next.js](https://nextjs.org/) - Fullstack.
- [React](https://react.dev/) - Utilises React as a Frontend.
- [Betterauth](https://www.better-auth.com/) - Authentication.
- [Postgress](https://www.postgresql.org/) - Open source relational database.
- [Drizzle ORM](https://orm.drizzle.team/) - Map entities to database tables.
- [Drizzle-kit](https://www.npmjs.com/package/drizzle-kit) - CLI tool to generate migrations.
- [Drizzle-zod](https://orm.drizzle.team/docs/zod) - Plugin that allows us to generate Zod schemas from Drizzle ORM.
- [Zod](https://zod.dev/) - TypeScript validation.
- [Sharp](https://github.com/lovell/sharp) - Resize, encode, ... images.
- [Tailwind](https://tailwindcss.com/) - Styling.
- [Shadcn](https://ui.shadcn.com/) - Make own component library.
- [Winston](https://github.com/winstonjs/winston) - Logging.
- [Tanstackquery](https://tanstack.com/query/latest) - Data fetching from API.
- [Eslint](https://eslint.org/) - Linter.
- [Swagger](https://swagger.io/) - Generating documentation.
- [Recharts](https://github.com/recharts/recharts) - Chart library.
- [Slick-carousel](https://github.com/kenwheeler/slick) - Carousel.
- [Day.js](https://github.com/iamkun/dayjs) - Immutable date-time library.
- [Docker](https://www.docker.com/products/docker-desktop/) - To run local containers of the database.
- [Bun](https://bun.com/) - All in one toolkit: bundler, javascript runtime, testrunner and package manager.

## Installation Instructions

### Prerequisites

Make sure you have:

- **Docker (if you prefer containerized dev envs)**

  - [Docker Desktop](https://www.docker.com/products/docker-desktop/)

> On linux you need to install docker and the docker-compose packages(look for instructions for your distro). If you want a GUI look into [Lazydocker](https://github.com/jesseduffield/lazydocker) or [Portrainer](https://github.com/portainer/portainer).

### Installing Bun

On Linux/Mac

```bash
curl -fsSL https://bun.com/install | bash
```

**Extra** step on Linux(see the command for your distro):

```bash
sudo apt install unzip
```

On Windows

```bash
powershell -c "irm bun.sh/install.ps1|iex"
```

Or install it with a package manager

```bash
npm install -g bun
```

### Running the app

Install packages

```bash
bun install
```

Start application

```bash
bun dev
```

Build application

```bash
bun build
```

Lint application

```bash
bun lint
```

> If `--bun` is used in a script commando in `package.json` then bun is used as runtime instead of node!

## Migrations

If you have changed the schema.ts file, you need to apply those schema changes to the database.
To do this generate first a migration file and afterwards apply it. However, if there is a team working on this project. Let the Project Lead know that a migration is needed for your pull request.

First step:

```bash
bun db:generate
```

Second step:

```bash
bun db:migrate
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## FYI

Nextjs gebruikt file based routing. Dus de naam van de volder in de /app map wordt de naam van de endpoint. In deze folder moet altijd een page.tsx file zitten en moet altijd page.tsx noemen
