import { appRouter } from '@/server';
import { httpBatchLink } from '@trpc/client';
import { env } from '../../../config';

export const serverClient = appRouter.createCaller(
    { links: [ httpBatchLink( { url: `https://${ env.VERCEL_URL }/api` } ) ] }
);