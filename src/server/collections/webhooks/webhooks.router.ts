import { publicProcedure, router } from '../../trpc';
import { createWebhook } from './webhooks.service';
import { createWebhookSchema } from './webhooks.validation';

export const webhooksRouter = router( {
    createWebhook: publicProcedure
        .input( createWebhookSchema )
        .mutation( async ( { input } ) => {
            const { payload, deliveryAddress } = input;

            const createWebhookResult = await createWebhook( {
                payload,
                deliveryAddress,
                attemptNumber: 1
            } );

            if ( createWebhookResult.isError() ) {
                return createWebhookResult.value;
            }

            return createWebhookResult.value;
        } )
} );