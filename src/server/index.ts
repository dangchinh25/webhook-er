import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { livelinessRouter, webhooksRouter } from './collections';
import { mergeRouters } from './trpc';
import { dbClient } from '../db';

// This will run the migration everytime there is a coming request
// In the context of serverless, it is every invocation
migrate( dbClient, { migrationsFolder: 'drizzle' } );

export const appRouter = mergeRouters(
    livelinessRouter,
    webhooksRouter
);

export type AppRouter = typeof appRouter;