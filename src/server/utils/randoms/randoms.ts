export const generateRandomString = (): string => {
    return Math.random()
        .toString( 36 )
        .substring( 2 );
};

export const generateRandomNumber = ( min: number, max: number ): number => {
    min = Math.ceil( min );
    max = Math.floor( max );
    return Math.floor( Math.random() * ( max - min + 1 ) ) + min;
};

export const generateRandomInteger = (): number => {
    return Math.floor( Math.random() * ( Math.pow( 2, 31 ) - 1 ) );
};