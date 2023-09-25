import { qstashServiceRequest } from '../qstash.request';
import { ResourceError } from '../../../errors';
import {
    Either,
    RequestMethod, error, success
} from '../../../types';
import { PublishMessageParams, PublishMessageResponse } from './messages.types';

export const publishMessage = async (
    params: PublishMessageParams
): Promise<Either<ResourceError, PublishMessageResponse>> => {
    const requestResult = await qstashServiceRequest<PublishMessageResponse>( {
        method: RequestMethod.POST,
        destinationUrl: params.destinationUrl,
        payload: params.payload
    } );

    if ( requestResult.isError() ) {
        return error( requestResult.value );
    }

    return success( requestResult.value );
};

export const publishMessageWithDelay = async (
    params: PublishMessageParams,
    deliveryTime: Date | string
): Promise<Either<ResourceError, PublishMessageResponse>> => {
    const deliveryTimeSeconds = Math.floor( new Date( deliveryTime ).getTime() / 1000 );

    const requestResult = await qstashServiceRequest<PublishMessageResponse>( {
        method: RequestMethod.POST,
        destinationUrl: params.destinationUrl,
        payload: params.payload,
        customHeaders: { [ 'Upstash-Not-Before' ]: deliveryTimeSeconds }
    } );

    if ( requestResult.isError() ) {
        return error( requestResult.value );
    }

    return success( requestResult.value );
};