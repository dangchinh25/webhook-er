import { z } from 'zod';

export const queuedWebhookSchema = z.object( { webhookId: z.number() } );