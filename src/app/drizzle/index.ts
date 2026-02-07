// import { drizzle } from 'drizzle-orm/bun-sql';

// const db = drizzle(process.env.DATABASE_URL);

// const result = await db.execute('select 1');

// console.log(result);
// import { drizzle } from "drizzle-orm/bun-sql";
// import { Pool } from "pg";

// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
// });
// const db = drizzle({ client: pool });
 
// const result = await db.execute('select 1');

import { drizzle } from 'drizzle-orm/bun-sql';
const db = drizzle(process.env.DATABASE_URL);
const result = await db.execute('select 1');

// import { drizzle } from 'drizzle-orm/bun-sql';
// import { SQL } from 'bun';
// const client = new SQL(process.env.DATABASE_URL!);
// const db = drizzle({ client });