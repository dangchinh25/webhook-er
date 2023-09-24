export type Either<L, A> = Error<L, A> | Success<L, A>;

export class Error<L, A> {
    readonly value: L;

    constructor ( value: L ) {
        this.value = value;
    }

    isError (): this is Error<L, A> {
        return true;
    }

    isSuccess (): this is Success<L, A> {
        return false;
    }
}

export class Success<L, A> {
    readonly value: A;

    constructor ( value: A ) {
        this.value = value;
    }

    isError (): this is Error<L, A> {
        return false;
    }

    isSuccess (): this is Success<L, A> {
        return true;
    }
}

export const error = <L, A>( l: L ): Either<L, A> => {
    return new Error( l );
};

export const success = <L, A>( a: A ): Either<L, A> => {
    return new Success<L, A>( a );
};

export type PickEitherRight<T> = T extends Either<unknown, infer R> ? R : never;

export type PickEitherLeft<T> = T extends Either<infer L, unknown> ? L : never;