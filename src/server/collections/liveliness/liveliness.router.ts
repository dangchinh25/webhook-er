import { publicProcedure, router } from '../../trpc';

export const livelinessRouter = router( {
    getLiveliness: publicProcedure
        .query( async () => {
            return { liveliness: true };
        } )
} );