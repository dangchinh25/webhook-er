import {
    livelinessRouter,
    webhooksRouter,
    queuedWebhooksRouter
} from './collections';
import { mergeRouters } from './trpc';

export const appRouter = mergeRouters(
    livelinessRouter,
    webhooksRouter,
    queuedWebhooksRouter
);

export type AppRouter = typeof appRouter;