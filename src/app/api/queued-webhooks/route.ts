import { AppRouter } from '@/server';
import { serverClient } from '../../_trpc/serverClient';
import { NextResponse } from 'next/server';

export const POST = async (
    req: Request
): Promise<Awaited<ReturnType<AppRouter['processQueuedWebhook']>>> => {
    return NextResponse.json(
        await serverClient.processQueuedWebhook( await req.json() )
    );
};