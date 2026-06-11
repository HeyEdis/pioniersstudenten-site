import { drizzle } from 'drizzle-orm/bun-sql';
import { SQL } from 'bun';
import { Logger } from 'drizzle-orm/logger';
import { getLogger } from './logging';

export const drizzleLogger: Logger = {
  logQuery(query: string, params: unknown[]): void {
    getLogger().info(params.length !== 0 ? `${query} - ${params}` : query);
  },
};

const client = new SQL(process.env.DATABASE_URL!);
export const db = drizzle({ client, logger: drizzleLogger });
