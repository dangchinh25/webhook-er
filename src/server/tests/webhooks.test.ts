import { inferProcedureInput } from '@trpc/server';
import { AppRouter, appRouter } from '..';
import * as WebhookServiceModule from '../collections/webhooks/webhooks.service';
import * as QstashMessageServiceModule from '../lib/qstash/messages/messages.service';
import * as QstashServiceModule from '../lib/qstash/qstash.request';
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
                attemptNumber: 1,
                type: 'instant'
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
            const updateWebhookSpy = jest.spyOn( WebhookServiceModule, 'updateWebhook' );
            const publishMessageSpy = jest.spyOn( QstashMessageServiceModule, 'publishMessage' );

            const createWebhooksResult = await trpcCaller.createWebhooks( input );

            expect( createWebhookSpy ).toHaveBeenCalledTimes( 2 );
            expect( createWebhookSpy ).toHaveBeenCalledWith( {
                payload: input.webhooks[ 0 ].payload,
                deliveryAddress: input.webhooks[ 0 ].deliveryAddress,
                attemptNumber: 1,
                type: 'instant'
            } );
            expect( createWebhookSpy ).toHaveBeenCalledWith( {
                payload: input.webhooks[ 1 ].payload,
                deliveryAddress: input.webhooks[ 1 ].deliveryAddress,
                attemptNumber: 1,
                type: 'instant'
            } );

            const createWebhook1Result = await createWebhookSpy.mock.results[ 0 ].value;
            const createWebhook2Result = await createWebhookSpy.mock.results[ 1 ].value;

            expect( publishMessageSpy ).toHaveBeenCalledTimes( 2 );
            expect( publishMessageSpy ).toHaveBeenCalledWith( {
                payload: { webhookId: createWebhook1Result.value.id },
                destinationUrl: 'https://localhost:3000/api/queued-webhooks'
            } );
            expect( publishMessageSpy ).toHaveBeenCalledWith( {
                payload: { webhookId: createWebhook2Result.value.id },
                destinationUrl: 'https://localhost:3000/api/queued-webhooks'
            } );

            expect( updateWebhookSpy ).toHaveBeenCalledTimes( 2 );
            expect( updateWebhookSpy ).toHaveBeenCalledWith(
                createWebhook1Result.value.id,
                { status: 'queued' }
            );
            expect( updateWebhookSpy ).toHaveBeenCalledWith(
                createWebhook2Result.value.id,
                { status: 'queued' }
            );

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

    describe( 'contains both instant and delay delivery', () => {
        it( 'creates webhook in database and calls qstash service with correct headers', async () => {
            const input: inferProcedureInput<AppRouter['createWebhooks']> = {
                webhooks: [
                    {
                        payload: { test: 'test-data-1' },
                        deliveryAddress: 'http://localhost:3001/something'
                    },
                    {
                        payload: { test: 'test-data-2' },
                        deliveryAddress: 'http://localhost:3002/something',
                        deliveryTime: new Date( new Date().getTime() + ( 5 * 1000 ) ).toISOString()
                    }
                ]
            };

            const createWebhookSpy = jest.spyOn( WebhookServiceModule, 'createWebhook' );
            const updateWebhookSpy = jest.spyOn( WebhookServiceModule, 'updateWebhook' );
            const qstashServiceRequestSpy = jest.spyOn( QstashServiceModule, 'qstashServiceRequest' );

            const createWebhooksResult = await trpcCaller.createWebhooks( input );

            expect( createWebhookSpy ).toHaveBeenCalledTimes( 2 );
            expect( createWebhookSpy ).toHaveBeenCalledWith( {
                payload: input.webhooks[ 0 ].payload,
                deliveryAddress: input.webhooks[ 0 ].deliveryAddress,
                attemptNumber: 1,
                type: 'instant'
            } );
            expect( createWebhookSpy ).toHaveBeenCalledWith( {
                payload: input.webhooks[ 1 ].payload,
                deliveryAddress: input.webhooks[ 1 ].deliveryAddress,
                attemptNumber: 1,
                type: 'delayed'
            } );

            const createWebhook1Result = await createWebhookSpy.mock.results[ 0 ].value;
            const createWebhook2Result = await createWebhookSpy.mock.results[ 1 ].value;

            expect( qstashServiceRequestSpy ).toHaveBeenCalledTimes( 2 );
            expect( qstashServiceRequestSpy ).toHaveBeenCalledWith( {
                method: 'POST',
                destinationUrl: 'https://localhost:3000/api/queued-webhooks',
                payload: { webhookId: createWebhook1Result.value.id }
            } );
            expect( qstashServiceRequestSpy ).toHaveBeenCalledWith( {
                method: 'POST',
                destinationUrl: 'https://localhost:3000/api/queued-webhooks',
                payload: { webhookId: createWebhook2Result.value.id },
                customHeaders: {
                    [ 'Upstash-Not-Before' ]:
                        Math.floor( new Date( input.webhooks[ 1 ].deliveryTime! ).getTime() / 1000 )
                }
            } );

            expect( updateWebhookSpy ).toHaveBeenCalledTimes( 2 );
            expect( updateWebhookSpy ).toHaveBeenCalledWith(
                createWebhook1Result.value.id,
                { status: 'queued' }
            );
            expect( updateWebhookSpy ).toHaveBeenCalledWith(
                createWebhook2Result.value.id,
                { status: 'queued' }
            );

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
            const updateWebhookSpy = jest.spyOn( WebhookServiceModule, 'updateWebhook' );
            const publishMessageSpy = jest.spyOn( QstashMessageServiceModule, 'publishMessage' );

            publishMessageSpy.mockImplementationOnce( async () => success( { messageId: '', url: '' } ) );
            publishMessageSpy.mockImplementationOnce( async () => error( new ResourceError( { message: '' } ) ) );

            const createWebhooksResult = await trpcCaller.createWebhooks( input );

            expect( createWebhookSpy ).toHaveBeenCalledTimes( 2 );
            expect( createWebhookSpy ).toHaveBeenCalledWith( {
                payload: input.webhooks[ 0 ].payload,
                deliveryAddress: input.webhooks[ 0 ].deliveryAddress,
                attemptNumber: 1,
                type: 'instant'
            } );
            expect( createWebhookSpy ).toHaveBeenCalledWith( {
                payload: input.webhooks[ 1 ].payload,
                deliveryAddress: input.webhooks[ 1 ].deliveryAddress,
                attemptNumber: 1,
                type: 'instant'
            } );

            const createWebhook1Result = await createWebhookSpy.mock.results[ 0 ].value;
            const createWebhook2Result = await createWebhookSpy.mock.results[ 1 ].value;

            expect( publishMessageSpy ).toHaveBeenCalledTimes( 2 );
            expect( publishMessageSpy ).toHaveBeenCalledWith( {
                payload: { webhookId: createWebhook1Result.value.id },
                destinationUrl: 'https://localhost:3000/api/queued-webhooks'
            } );
            expect( publishMessageSpy ).toHaveBeenCalledWith( {
                payload: { webhookId: createWebhook2Result.value.id },
                destinationUrl: 'https://localhost:3000/api/queued-webhooks'
            } );

            expect( updateWebhookSpy ).toHaveBeenCalledTimes( 1 );
            expect( updateWebhookSpy ).toHaveBeenCalledWith(
                createWebhook1Result.value.id,
                { status: 'queued' }
            );

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
            const updateWebhookSpy = jest.spyOn( WebhookServiceModule, 'updateWebhook' );
            const publishMessageSpy = jest.spyOn( QstashMessageServiceModule, 'publishMessage' );

            createWebhookSpy.mockImplementationOnce( async () => error( new ResourceError( { message: '' } ) ) );

            const createWebhooksResult = await trpcCaller.createWebhooks( input );

            expect( createWebhookSpy ).toHaveBeenCalledTimes( 2 );
            expect( createWebhookSpy ).toHaveBeenCalledWith( {
                payload: input.webhooks[ 0 ].payload,
                deliveryAddress: input.webhooks[ 0 ].deliveryAddress,
                attemptNumber: 1,
                type: 'instant'
            } );
            expect( createWebhookSpy ).toHaveBeenCalledWith( {
                payload: input.webhooks[ 1 ].payload,
                deliveryAddress: input.webhooks[ 1 ].deliveryAddress,
                attemptNumber: 1,
                type: 'instant'
            } );

            const createWebhook2Result = await createWebhookSpy.mock.results[ 1 ].value;

            expect( publishMessageSpy ).toHaveBeenCalledTimes( 1 );
            expect( publishMessageSpy ).toHaveBeenCalledWith( {
                payload: { webhookId: createWebhook2Result.value.id },
                destinationUrl: 'https://localhost:3000/api/queued-webhooks'
            } );

            expect( updateWebhookSpy ).toHaveBeenCalledTimes( 1 );
            expect( updateWebhookSpy ).toHaveBeenCalledWith(
                createWebhook2Result.value.id,
                { status: 'queued' }
            );

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