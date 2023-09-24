import { livelinessRouter, webhooksRouter } from './collections';
import { mergeRouters } from './trpc';

export const appRouter = mergeRouters(
    livelinessRouter,
    webhooksRouter
);

export type AppRouter = typeof appRouter;