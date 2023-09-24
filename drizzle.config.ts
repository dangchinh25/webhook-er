import { type Config } from 'drizzle-kit';
import { env } from './config';

const DATABASE_URL = `postgresql://${ env.POSTGRES_USER }:${ env.POSTGRES_PASSWORD }@${ env.POSTGRES_HOST }:${ env.POSTGRES_PORT }/${ env.POSTGRES_DB }?schema=public`;

export default {
    schema: './src/db/schema.ts',
    out: './drizzle',
    driver: 'pg',

    // TODO template literal may not work here
    dbCredentials: { connectionString: DATABASE_URL }
} satisfies Config;