import {
    generateRandomInteger,
    generateRandomString,
    generateRandomNumber
} from './randoms';

describe( 'generateRandomInteger', () => {

    it(
        'returns a random integer',
        () => {
            const randomInteger = generateRandomInteger();

            expect( typeof randomInteger )
                .toBe( 'number' );
        }
    );

} );

describe( 'generateRandomString', () => {

    it(
        'returns a random string',
        () => {
            const randomString = generateRandomString();

            expect( typeof randomString )
                .toBe( 'string' );
        }
    );

} );

describe( 'generateRandomNumber', () => {

    it(
        'returns a random string',
        () => {
            const min = 50;
            const max = 100;
            const randomNumber = generateRandomNumber( min, max );

            expect( typeof randomNumber )
                .toBe( 'number' );

            expect( randomNumber )
                .toBeGreaterThanOrEqual( min );

            expect( randomNumber )
                .toBeLessThanOrEqual( max );
        }
    );

} );