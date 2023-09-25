import { inferProcedureInput } from '@trpc/server';
import { AppRouter, appRouter } from '..';
import * as WebhookServiceModule from '../collections/webhooks/webhooks.service';
import * as QstashMessageServiceModule from '../lib/qstash/messages/messages.service';
import { error, success } from '../types';
import { ResourceError } from '../errors';

const trpcCaller = appRouter.createCaller( {} );

describe( 'createWebhook', () => {
    describe( 'generic success flow', () => {
        it( 'creates webhook in database', async () => {
            const input: inferProcedureInput<AppRouter['createWebhook']> = {
                payload: { test: 'test-data' },
                deliveryAddress: 'http://localhost:3000/something'
            };

            const createWebhookSpy = jest.spyOn( WebhookServiceModule, 'createWebhook' );

            const createWebhookResult = await trpcCaller.createWebhook( input );

            expect( createWebhookSpy ).toHaveBeenCalledTimes( 1 );
            expect( createWebhookSpy ).toHaveBeenCalledWith( {
                payload: input.payload,
                deliveryAddress: input.deliveryAddress,
                attemptNumber: 1
            } );

            expect( createWebhookResult ).toStrictEqual(
                expect.objectContaining( {
                    payload: input.payload,
                    deliveryAddress: input.deliveryAddress,
                    attemptNumber: 1
                } )
            );
        } );
    } );
} );

describe( 'createWebhooks', () => {
    describe( 'generic success flow', () => {
        it( 'creates webhook in database and publish qstash messages', async () => {
            const input: inferProcedureInput<AppRouter['createWebhooks']> = {
                webhooks: [
                    {
                        payload: { test: 'test-data-1' },
                        deliveryAddress: 'http://localhost:3001/something'
                    },
                    {
                        payload: { test: 'test-data-2' },
                        deliveryAddress: 'http://localhost:3002/something'
                    }
                ]
            };

            const createWebhookSpy = jest.spyOn( WebhookServiceModule, 'createWebhook' );
            const publishMessageSpy = jest.spyOn( QstashMessageServiceModule, 'publishMessage' );

            const createWebhooksResult = await trpcCaller.createWebhooks( input );

            expect( createWebhookSpy ).toHaveBeenCalledTimes( 2 );
            expect( createWebhookSpy ).toHaveBeenCalledWith( {
                payload: input.webhooks[ 0 ].payload,
                deliveryAddress: input.webhooks[ 0 ].deliveryAddress,
                attemptNumber: 1
            } );
            expect( createWebhookSpy ).toHaveBeenCalledWith( {
                payload: input.webhooks[ 1 ].payload,
                deliveryAddress: input.webhooks[ 1 ].deliveryAddress,
                attemptNumber: 1
            } );

            const createWebhook1Result = await createWebhookSpy.mock.results[ 0 ].value;
            const createWebhook2Result = await createWebhookSpy.mock.results[ 1 ].value;

            expect( publishMessageSpy ).toHaveBeenCalledTimes( 2 );
            expect( publishMessageSpy ).toHaveBeenCalledWith( {
                payload: { webhookId: createWebhook1Result.value.id },
                destinationUrl: 'http://localhost:3000/api/queued-webhooks'
            } );
            expect( publishMessageSpy ).toHaveBeenCalledWith( {
                payload: { webhookId: createWebhook2Result.value.id },
                destinationUrl: 'http://localhost:3000/api/queued-webhooks'
            } );

            expect( createWebhooksResult ).toStrictEqual( {
                successes: expect.toIncludeAllMembers( [
                    {
                        params: input.webhooks[ 0 ],
                        webhook: createWebhook1Result.value
                    },
                    {
                        params: input.webhooks[ 1 ],
                        webhook: createWebhook2Result.value
                    }
                ] ),
                failures: []
            } );
        } );
    } );

    describe( 'one of the calls to qstash fails', () => {
        it( 'returns correct response with both successes and failures', async () => {
            const input: inferProcedureInput<AppRouter['createWebhooks']> = {
                webhooks: [
                    {
                        payload: { test: 'test-data-1' },
                        deliveryAddress: 'http://localhost:3001/something'
                    },
                    {
                        payload: { test: 'test-data-2' },
                        deliveryAddress: 'http://localhost:3002/something'
                    }
                ]
            };

            const createWebhookSpy = jest.spyOn( WebhookServiceModule, 'createWebhook' );
            const publishMessageSpy = jest.spyOn( QstashMessageServiceModule, 'publishMessage' );

            publishMessageSpy.mockImplementationOnce( async () => success( { messageId: '', url: '' } ) );
            publishMessageSpy.mockImplementationOnce( async () => error( new ResourceError( { message: '' } ) ) );

            const createWebhooksResult = await trpcCaller.createWebhooks( input );

            expect( createWebhookSpy ).toHaveBeenCalledTimes( 2 );
            expect( createWebhookSpy ).toHaveBeenCalledWith( {
                payload: input.webhooks[ 0 ].payload,
                deliveryAddress: input.webhooks[ 0 ].deliveryAddress,
                attemptNumber: 1
            } );
            expect( createWebhookSpy ).toHaveBeenCalledWith( {
                payload: input.webhooks[ 1 ].payload,
                deliveryAddress: input.webhooks[ 1 ].deliveryAddress,
                attemptNumber: 1
            } );

            const createWebhook1Result = await createWebhookSpy.mock.results[ 0 ].value;
            const createWebhook2Result = await createWebhookSpy.mock.results[ 1 ].value;

            expect( publishMessageSpy ).toHaveBeenCalledTimes( 2 );
            expect( publishMessageSpy ).toHaveBeenCalledWith( {
                payload: { webhookId: createWebhook1Result.value.id },
                destinationUrl: 'http://localhost:3000/api/queued-webhooks'
            } );
            expect( publishMessageSpy ).toHaveBeenCalledWith( {
                payload: { webhookId: createWebhook2Result.value.id },
                destinationUrl: 'http://localhost:3000/api/queued-webhooks'
            } );

            expect( createWebhooksResult ).toStrictEqual( {
                successes: expect.toIncludeAllMembers( [
                    {
                        params: input.webhooks[ 0 ],
                        webhook: createWebhook1Result.value
                    }
                ] ),
                failures: [
                    {
                        params: input.webhooks[ 1 ],
                        error: expect.objectContaining( { message: '' } )
                    }
                ]
            } );
        } );
    } );

    describe( 'one of the calls to create webhook fails', () => {
        it( 'returns correct response with both successes and failures', async () => {
            const input: inferProcedureInput<AppRouter['createWebhooks']> = {
                webhooks: [
                    {
                        payload: { test: 'test-data-1' },
                        deliveryAddress: 'http://localhost:3001/something'
                    },
                    {
                        payload: { test: 'test-data-2' },
                        deliveryAddress: 'http://localhost:3002/something'
                    }
                ]
            };

            const createWebhookSpy = jest.spyOn( WebhookServiceModule, 'createWebhook' );
            const publishMessageSpy = jest.spyOn( QstashMessageServiceModule, 'publishMessage' );

            createWebhookSpy.mockImplementationOnce( async () => error( new ResourceError( { message: '' } ) ) );

            const createWebhooksResult = await trpcCaller.createWebhooks( input );

            expect( createWebhookSpy ).toHaveBeenCalledTimes( 2 );
            expect( createWebhookSpy ).toHaveBeenCalledWith( {
                payload: input.webhooks[ 0 ].payload,
                deliveryAddress: input.webhooks[ 0 ].deliveryAddress,
                attemptNumber: 1
            } );
            expect( createWebhookSpy ).toHaveBeenCalledWith( {
                payload: input.webhooks[ 1 ].payload,
                deliveryAddress: input.webhooks[ 1 ].deliveryAddress,
                attemptNumber: 1
            } );

            const createWebhook2Result = await createWebhookSpy.mock.results[ 1 ].value;

            expect( publishMessageSpy ).toHaveBeenCalledTimes( 1 );
            expect( publishMessageSpy ).toHaveBeenCalledWith( {
                payload: { webhookId: createWebhook2Result.value.id },
                destinationUrl: 'http://localhost:3000/api/queued-webhooks'
            } );

            expect( createWebhooksResult ).toStrictEqual( {
                successes: expect.toIncludeAllMembers( [
                    {
                        params: input.webhooks[ 1 ],
                        webhook: createWebhook2Result.value
                    }
                ] ),
                failures: [
                    {
                        params: input.webhooks[ 0 ],
                        error: expect.objectContaining( { message: '' } )
                    }
                ]
            } );
        } );
    } );
} );