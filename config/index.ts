/* eslint-disable @typescript-eslint/naming-convention */
import dotenv from 'dotenv';
import {
    cleanEnv,
    str
} from 'envalid';

dotenv.config( { path: '.env' } );

export const env = cleanEnv( process.env, {
    POSTGRES_USER: str( { default: undefined } ),
    POSTGRES_PASSWORD: str( { default: undefined } ),
    POSTGRES_HOST: str( { default: undefined } ),
    POSTGRES_PORT: str( { default: undefined } ),
    POSTGRES_DB: str( { default: undefined } ),
    DATABASE_URL: str( { default: undefined } ),
    HOST_URL: str( { default: 'http://localhost:3000' } ),
    LOG_LEVEL: str( { default: 'debug' } ),
    IS_LOCAL: str( { default: undefined } )
} );