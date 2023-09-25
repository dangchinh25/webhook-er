import { z } from 'zod';

export const createWebhookSchema = z.object( {
    payload: z.record( z.any() ),
    deliveryAddress: z.string().url(),
    deliveryTime: z.string().datetime( { offset: true } )
        .optional()
} );

export const createWebhooksSchema = z.object( { webhooks: z.array( createWebhookSchema ) } );