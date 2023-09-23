import { NextResponse } from 'next/server';
import { serverClient } from '../_trpc/serverClient';
import { AppRouter } from '@/server';

const handler = async (): Promise<Awaited<ReturnType<AppRouter['getLiveliness']>>> => {
    const getLivelinessResult = await serverClient.getLiveliness();

    return NextResponse.json( getLivelinessResult );
};

export { handler as GET };