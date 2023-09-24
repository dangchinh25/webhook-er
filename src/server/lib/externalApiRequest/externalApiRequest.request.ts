import axios from 'axios';
import { env } from '../../../../config';
import { ResourceError } from '../../errors';
import {
    Either, success, error
} from '../../types';
import { MakeRequestParams } from './externalApiRequest.types';

const axiosInstance = axios.create( { headers: { [ 'Content-Type' ]: 'application/json' } } );

export const makeRequest = async <T = unknown>( {
    method,
    url,
    body
}: MakeRequestParams ): Promise<Either<ResourceError, T>> => {
    if ( env.IS_INTEGRATION_TEST === 'true' ) {
        return success( {} as T );
    }

    try {
        const response = await axiosInstance( {
            method,
            url,
            data: body
        } );

        return success( response?.data as T );
    } catch ( err ) {
        if ( !axios.isAxiosError( err ) ) {
            console.error( err );
            return error(
                new ResourceError( {
                    message: 'Error running makeRequest',
                    error: err
                } )
            );
        }

        const { response } = err;

        return error(
            new ResourceError( {
                message: `Error making axios Api call to ${ url } - ${ err.message }`,
                error: response?.data,
                statusCode: response?.data ? response.status : 500
            } )
        );
    }
};