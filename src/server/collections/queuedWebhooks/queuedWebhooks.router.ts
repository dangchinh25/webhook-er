import { publicProcedure, router } from '../../trpc';
import { getWebhook } from '../webhooks/webhooks.service';
import { queuedWebhookSchema } from './queuedWebhooks.validation';

export const queuedWebhooksRouter = router( {
    processQueuedWebhook: publicProcedure
        .input( queuedWebhookSchema )
        .mutation( async ( { input } ) => {
            const { webhookId } = input;

            const getWebhookResult = await getWebhook( webhookId );

            return getWebhookResult.value;
        } )
} );