import { drizzle } from "drizzle-orm/bun-sql";
import { sql } from "bun";

const postgres = new sql("postgres.db");
export const db = drizzle(postgres);