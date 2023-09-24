import { AppRouter } from '@/server';
import { serverClient } from '../../_trpc/serverClient';
import { NextResponse } from 'next/server';

export const POST = async ( req: Request ): Promise<Awaited<ReturnType<AppRouter['createWebhook']>>> => {
    return NextResponse.json( await serverClient.createWebhook( await req.json() ) );
};
