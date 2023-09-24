import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { env } from '../../../../config';
import { QstashServiceRequestParams } from './qstash.types';
import {
    Either, error, success
} from '../../types';
import { ResourceError } from '../../errors';
import { QstashServiceError } from './qstash.errors';

export const BASE_URL = env.QSTASH_URL;

const axiosInstance = axios.create( {
    headers: {
        [ 'Content-Type' ]: 'application/json',
        [ 'Authorization' ]: `Bearer ${ env.QSTASH_TOKEN }`
    }
} );

export const qstashServiceRequest = async <T>( {
    method,
    destinationUrl,
    payload
}: QstashServiceRequestParams ): Promise<Either<ResourceError, T>> => {
    try {
        const axiosInstanceParams: AxiosRequestConfig = {
            method,
            url: `${ env.QSTASH_URL }/${ destinationUrl }`,
            data: payload
        };

        const response = await axiosInstance( axiosInstanceParams );

        return success( response?.data as T );
    } catch ( err ) {
        if ( !axios.isAxiosError( err ) ) {
            console.error( err );
            return error(
                new ResourceError( {
                    message: 'Error running qstashServiceRequest',
                    error: err
                } )
            );
        }

        const response = err.response as AxiosResponse<ResourceError>;

        return error( new QstashServiceError( response ) );
    }
};