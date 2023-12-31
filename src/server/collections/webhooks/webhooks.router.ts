import { Webhook } from '../../../db';
import { publicProcedure, router } from '../../trpc';
import { createWebhook, updateWebhook } from './webhooks.service';
import { CreateWebhooksResponse } from './webhooks.types';
import { createWebhookSchema, createWebhooksSchema } from './webhooks.validation';
import { env } from '../../../../config';
import {
    publishMessage as publishQstashMessage,
    publishMessageWithDelay as publishQstashMessageWithDelay
} from '../../lib/qstash';

export const webhooksRouter = router( {
    createWebhook: publicProcedure
        .input( createWebhookSchema )
        .mutation( async ( { input } ) => {
            const { payload, deliveryAddress } = input;

            const createWebhookResult = await createWebhook( {
                payload,
                deliveryAddress,
                attemptNumber: 1,
                type: 'instant'
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
                        attemptNumber: 1,
                        type: createWebhookParams.deliveryTime ? 'delayed' : 'instant'
                    } )
                );
            }

            const createWebhooksResults = await Promise.all( createWebhookPromises );
            const successCreateWebhooksParams: ( typeof createWebhookSchema['_input'] )[] = [];
            const successCreateWebhooks: ( typeof Webhook.$inferSelect )[] = [];
            const publishQstashMessagesPromises: ReturnType<typeof publishQstashMessageQueuedWebhook>[] = [];

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

                if ( createWebhooksParams[ i ].deliveryTime ) {
                    publishQstashMessagesPromises.push(
                        publishQstashMessageQueuedWebhook(
                            createWebhookResult.value.id,
                            createWebhooksParams[ i ].deliveryTime as string
                        )
                    );
                } else {
                    publishQstashMessagesPromises.push(
                        publishQstashMessageQueuedWebhook( createWebhookResult.value.id )
                    );
                }
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

            const updateWebhooksStatusPromises: ReturnType<typeof updateWebhook>[] = [];

            for ( const { webhook } of createWebhooksResponse.successes ) {
                updateWebhooksStatusPromises.push(
                    updateWebhook(
                        webhook.id,
                        { status: 'queued' }
                    )
                );
            }

            // As the app will be deployed on Serverless function
            // we have to await otherwise the execution will be aborted
            await Promise.all( updateWebhooksStatusPromises );

            return createWebhooksResponse;
        } )
} );

const publishQstashMessageQueuedWebhook = async (
    webhookId: number,
    deliveryTime?: string | Date
): ReturnType<typeof publishQstashMessage> => {
    const publishQstashMessageParams = {
        destinationUrl: `https://${ env.VERCEL_URL }/api/queued-webhooks`,
        payload: { webhookId }
    };

    if ( deliveryTime ) {
        return await publishQstashMessageWithDelay(
            publishQstashMessageParams,
            deliveryTime
        );
    }

    return await publishQstashMessage( publishQstashMessageParams );
};