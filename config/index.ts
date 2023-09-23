/* eslint-disable @typescript-eslint/naming-convention */
import dotenv from 'dotenv';
import {
    cleanEnv,
} from 'envalid';

dotenv.config( { path: '.env' } );

export const env = cleanEnv( process.env, {
} );