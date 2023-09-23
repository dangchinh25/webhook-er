import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { env } from '../../config';
import * as schema from './schema';

const pool = new Pool( { connectionString: env.DATABASE_URL } );

export const dbClient = drizzle( pool, { schema } );