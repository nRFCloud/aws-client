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

const dzRefreshEndpointBases = {
  dev: 'https://local.account.nrfcloud.com/web/refresh/?refreshToken=',
  beta: 'https://beta.account.nrfcloud.com/web/refresh/?refreshToken=',
  prod: 'https://account.nrfcloud.com/web/refresh/?refreshToken=',

  // Keep these around for compatibility, until they are not used anymore
  development: 'https://local.account.nrfcloud.com/web/refresh/?refreshToken=',
  production: 'https://account.nrfcloud.com/web/refresh/?refreshToken=',
};

export type Stage = 'dev' | 'beta' | 'prod' | 'development' | 'production';

export const dzRefreshEndpoint = (refreshToken: string, stage: Stage) =>
  `${dzRefreshEndpointBases[stage]}${refreshToken}`;
