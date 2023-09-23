import { mergeRouters } from './trpc';

export const appRouter = mergeRouters();

export type AppRouter = typeof appRouter;