import { livelinessRouter } from './collections';
import { mergeRouters } from './trpc';

export const appRouter = mergeRouters( livelinessRouter );

export type AppRouter = typeof appRouter;