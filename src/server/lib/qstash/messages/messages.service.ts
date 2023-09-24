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