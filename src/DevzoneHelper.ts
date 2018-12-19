import * as AWS from 'aws-sdk';
import 'url-search-params-polyfill';

// URLSearchParams is not supported in IE
export function getQueryStringValue(key: string) {
    const params = new URLSearchParams(location.search);
    return params.get(key);
}

export function isDevZoneLogin(): boolean {
    return !!getQueryStringValue('token');
}

export function getCredentials(): AWS.CognitoIdentityCredentials {
    const token = getQueryStringValue('token');
    let cognitoCredentials;
    if (token) {
        const {aud: IdentityPoolId, sub: IdentityId} = JSON.parse(atob(token.split('.')[1]));
        cognitoCredentials = new AWS.CognitoIdentityCredentials({
            IdentityPoolId,
            IdentityId,
            Logins: {
                'cognito-identity.amazonaws.com': token,
            },
        });
    }

    return cognitoCredentials;
}
