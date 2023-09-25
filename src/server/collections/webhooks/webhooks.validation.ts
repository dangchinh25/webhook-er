import { z } from 'zod';

export const createWebhookSchema = z.object( {
    payload: z.record( z.any() ),
    deliveryAddress: z.string().url()
} );

export const createWebhooksSchema = z.object( { webhooks: z.array( createWebhookSchema ) } );