import { type Config } from 'drizzle-kit';
import { env } from './config';

export default {
    schema: './src/db/schema.ts',
    out: './drizzle',
    driver: 'pg',
    // TODO template literal may not work here
    dbCredentials: { connectionString: env.DATABASE_URL }
} satisfies Config;