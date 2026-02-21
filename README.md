# Getting Started

## Technologies & Packages Used

- [Next.js](https://nextjs.org/) - Fullstack framework.
- [React](https://react.dev/) - NextJS utilises React as it's frontend.
- [Docker](https://www.docker.com/products/docker-desktop/) - To run local containers of the database.
- [Bun](https://bun.com/) - All in one toolkit: bundler, javascript runtime, testrunner and package manager.
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
- [Eslint](https://eslint.org/) - To enforce code formatting rules.
- [Swagger](https://swagger.io/) - Generating API documentation.
- [Recharts](https://github.com/recharts/recharts) - Chart library.
- [Slick-carousel](https://github.com/kenwheeler/slick) - Carousel.
- [Day.js](https://github.com/iamkun/dayjs) - Immutable date-time library.
- [Faker](https://v10.fakerjs.dev/) - For generating mock data.

## Installation Instructions

### Prerequisites

Make sure you have:

- **Docker**

  - [Docker Desktop](https://www.docker.com/products/docker-desktop/)

> On linux you need to install docker and the docker-compose packages(look for instructions for your distro). If you want a GUI look into [Lazydocker](https://github.com/jesseduffield/lazydocker), [Portrainer](https://github.com/portainer/portainer), [Podman](https://github.com/podman-desktop/podman-desktop) or something else.

### Database GUI

To check upon the seeded data in your local docker container it's usefull to install [pgAdmin](https://www.pgadmin.org/). It's a tool to look into your database and perform querries, generate ERD diagrams, etc. There is also [Dbbeaver](https://dbeaver.io/download/) this has a look and feel like mysql workbench, however you can use any database with it and have multiple different ones attached.

Alternativly you can go into the docker GUI to the exec tab and execute `psql -U postgres -d pioniersstudenten` to connect to postgresSQL and then list all the tables with `\dt` and query the data with `SELECT * from events`.

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
bun run build
```

Lint application

```bash
bun lint
```

> If `--bun` is used in a script commando in `package.json` then bun is used as runtime instead of node!

## Migrations

If you have changed the schema.ts file, you need to apply those schema changes to the database. However, if there is a team working on this project. Let the Project Lead know that a migration is needed for your pull request. They will generate a migration once your PR is merged.

First step:

```bash
bun db:generate
```

Second step:

```bash
bun db:migrate
```

## Environment variables

To setup the docker containers, make a `.env` and an `.env.test` file.

Example .env config:

```bash
APP_ENV=development

POSTGRES_DB=pioniersstudenten
POSTGRES_USERNAME=postgres
POSTGRES_PASSWORD=kiesEenWachtwoord

DATABASE_URL=postgres://postgres:kiesEenWachtwoord@localhost:5432/pioniersstudenten

BETTER_AUTH_SECRET=<insert generated secret here>
BETTER_AUTH_URL=http://localhost:3000
```

Better-auth secret can be generated here: https://www.better-auth.com/docs/installation#set-environment-variables

Example .env.test config:

```bash
APP_ENV=test
LOG_LEVEL=error

POSTGRES_DB=pioniersstudenten-test
POSTGRES_USER=test
POSTGRES_PASSWORD=kiesEenWachtwoord
TZ=Europe/Brussels

DATABASE_URL=postgres://test:kiesEenWachtwoord@localhost:5434/pioniersstudenten-test

BETTER_AUTH_SECRET=<insert generated secret here>
BETTER_AUTH_URL=http://localhost:3000
```

Better-auth secret can be generated here: https://www.better-auth.com/docs/installation#set-environment-variables

## Logging

Winston is used for logging on the server side, database logging will automatically use winston as the logger.

To use the winston logger in the server, import and use getLogger like this:

```javascript
getLogger().info("your info log");
getLogger().warning("your warning log");
getLogger().error("your error log");
```

To log in the client side of the application just use the standard `console.log()`, winston does not support client side logging.

## Configs

There are config files for every environment and a default config in the `config` folder, these configs can be used for storing environment specific variables for things like logging, auth, docs, cors, ...

You can also add custom environment variables from your `.env` in the `custom-environment-variables.ts` file.

## Testing

To run the tests you will need to setup your test db. This command applies the migrations and seeds the db. Also bun expects the `APP_ENV` variable to be named 'test' so make sure thats done.

```bash
bun test:setup
```

Afterwards, open a new terminal and run `bun dev` because the test runner needs an online instance and run `bun test` to execute them all.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!
