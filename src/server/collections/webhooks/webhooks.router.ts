import { Webhook } from '../../../db';
import { publishMessage as publishQstashMessage } from '../../lib/qstash';
import { publicProcedure, router } from '../../trpc';
import { createWebhook } from './webhooks.service';
import { CreateWebhooksResponse } from './webhooks.types';
import { createWebhookSchema, createWebhooksSchema } from './webhooks.validation';

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
        } ),
    createWebhooks: publicProcedure
        .input( createWebhooksSchema )
        .mutation( async ( { input } ) => {
            const { webhooks: createWebhooksParams } = input;

            const createWebhooksResponse: CreateWebhooksResponse = {
                successes: [],
                failures: []
            };

            const createWebhookPromises: Promise<Awaited<ReturnType<typeof createWebhook>>>[] = [];

            for ( const createWebhookParams of createWebhooksParams ) {
                createWebhookPromises.push(
                    createWebhook( {
                        payload: createWebhookParams.payload,
                        deliveryAddress: createWebhookParams.deliveryAddress,
                        attemptNumber: 1
                    } )
                );
            }

            const createWebhooksResults = await Promise.all( createWebhookPromises );
            const successCreateWebhooksParams: ( typeof createWebhookSchema['_input'] )[] = [];
            const successCreateWebhooks: ( typeof Webhook.$inferSelect )[] = [];
            const publishQstashMessagesPromises: Promise<Awaited<ReturnType<typeof publishQstashMessage>>>[] = [];

            createWebhooksResultsIteration:
            for ( let i = 0; i < createWebhooksParams.length; i++ ) {
                const createWebhookResult = createWebhooksResults[ i ];

                if ( createWebhookResult.isError() ) {
                    createWebhooksResponse.failures.push( {
                        params: createWebhooksParams[ i ],
                        error: createWebhookResult.value
                    } );

                    continue createWebhooksResultsIteration;
                }

                successCreateWebhooksParams.push( createWebhooksParams[ i ] );
                successCreateWebhooks.push( createWebhookResult.value );

                publishQstashMessagesPromises.push(
                    publishQstashMessage( {
                        destinationUrl: createWebhookResult.value.deliveryAddress,
                        payload: createWebhookResult.value.payload as Record<string, unknown>
                    } )
                );
            }

            const publishQstashMessagesResults = await Promise.all( publishQstashMessagesPromises );

            publishQstashMessagesResultsIteration:
            for ( let i = 0; i < publishQstashMessagesResults.length; i++ ) {
                const publishQstashMessagesResult = publishQstashMessagesResults[ i ];

                if ( publishQstashMessagesResult.isError() ) {
                    createWebhooksResponse.failures.push( {
                        params: successCreateWebhooksParams[ i ],
                        error: publishQstashMessagesResult.value
                    } );

                    continue publishQstashMessagesResultsIteration;
                }

                createWebhooksResponse.successes.push( {
                    params: successCreateWebhooksParams[ i ],
                    webhook: successCreateWebhooks[ i ]
                } );
            }

            return createWebhooksResponse;
        } )
} );