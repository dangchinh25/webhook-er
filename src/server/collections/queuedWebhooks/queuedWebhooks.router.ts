import { RequestMethod } from '../../types';
import { makeRequest } from '../../lib/externalApiRequest';
import { publicProcedure, router } from '../../trpc';
import { getWebhook, updateWebhook } from '../webhooks/webhooks.service';
import { queuedWebhookSchema } from './queuedWebhooks.validation';

export const queuedWebhooksRouter = router( {
    processQueuedWebhook: publicProcedure
        .input( queuedWebhookSchema )
        .mutation( async ( { input } ) => {
            const { webhookId } = input;

            const getWebhookResult = await getWebhook( webhookId );

            if ( getWebhookResult.isError() ) {
                return getWebhookResult.value;
            }

            const {
                deliveryAddress, payload, attemptNumber, deliveredAt
            } = getWebhookResult.value;

            if ( deliveredAt ) {
                return {};
            }

            const sendWebhookResult = await makeRequest( {
                method: RequestMethod.POST,
                url: deliveryAddress,
                body: payload as Record<string, unknown>
            } );

            if ( sendWebhookResult.isError() ) {
                await updateWebhook(
                    webhookId,
                    { attemptNumber: attemptNumber + 1 }
                );

                return sendWebhookResult.value;
            }

            await updateWebhook(
                webhookId,
                { deliveredAt: new Date(), status: 'delivered' }
            );

            return {};
        } )
} );