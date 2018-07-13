import * as AWS from 'aws-sdk';
require('amazon-cognito-js');
import * as AmazonCognitoIdentity from 'amazon-cognito-identity-js';
import {Logger} from 'Iris-FE/src/logger/Logger';
import {CognitoUserSession} from "amazon-cognito-identity-js";

const {CognitoSyncManager, CognitoIdentityCredentials} = AWS; // provided by dist/amazon-cognito.min.js from https://github.com/aws/amazon-cognito-js (NOT Amplify!)
const {AuthenticationDetails, CognitoUser, CognitoRefreshToken, CognitoUserAttribute, CognitoUserPool} = AmazonCognitoIdentity; // provided by dist/amazon-cognito-identity.min.js from https://github.com/aws/aws-amplify/tree/master/packages/amazon-cognito-identity-js

// TODO: Make COGNITO_USER_POOL_ID configurable externally
// TODO: Make COGNITO_CLIENT_ID configurable externally
// TODO: Make COGNITO_IDENTITY_POOL_ID configurable externally
const COGNITO_USER_POOL_ID = 'us-east-1_fdiBa7JSO';
const COGNITO_CLIENT_ID = '2p40shpt1ru5gerbip9limhm15';
const COGNITO_IDENTITY_POOL_ID = 'us-east-1:c00e1327-dfc2-4aa7-a484-8ca366d11a68';
const AWS_REGION = 'us-east-1';
const USERPOOL_IDP = `cognito-idp.${AWS_REGION}.amazonaws.com/${COGNITO_USER_POOL_ID}`;

AWS.config.region = AWS_REGION;

export const userPool = new CognitoUserPool({
	UserPoolId: COGNITO_USER_POOL_ID,
	ClientId: COGNITO_CLIENT_ID,
});

namespace Cognito {

	async function getCurrentUser(): Promise<AmazonCognitoIdentity.CognitoUser | null> {
		const currentUser = userPool.getCurrentUser();
		if (currentUser) {
			await getUserSession();
		}

		return currentUser;
	}

	/**
	 * Logs out the currently logged-in user
	 */
	export const logout = async () => {
		clearRefreshCredentials();
		const currentCognitoUser = await getCurrentUser();
		if (currentCognitoUser) {
			currentCognitoUser.signOut();
		}
	};

	const STORAGE_KEY = 'nrfcloudCognitoData';

	const clearRefreshCredentials = (): void => {
		localStorage.removeItem(STORAGE_KEY);
	};

	const storeRefreshCredentials = (username: string, refreshToken): void => {
		localStorage.setItem(STORAGE_KEY, JSON.stringify({
			username,
			refreshToken: refreshToken.getToken(),
		}));
	};

	const retrieveRefreshCredentials = (): { username: string, refreshToken } | null => {
		const data = localStorage.getItem(STORAGE_KEY);
		if (!data) {
			return null;
		}
		const {username, refreshToken} = JSON.parse(data);
		return {
			username,
			refreshToken: new CognitoRefreshToken({RefreshToken: refreshToken}),
		};
	};

	/**
	 * Attempts to change the password of the currently logged-in user
	 * @param oldPassword Old password
	 * @param newPassword Desired new password
	 */
	export const changePassword = async (oldPassword, newPassword) => {
		const currentCognitoUser = await getCurrentUser();
		if (!currentCognitoUser || typeof currentCognitoUser.changePassword !== 'function') {
			throw 'Need an authenticated user to change password';
		}
		return new Promise((resolve, reject) => currentCognitoUser.changePassword(oldPassword, newPassword, (error, result) => {
			if (error) {
				return reject(error);
			}

			resolve(result);
		}));
	};

	/**
	 * Starts forgot password flow. Call confirmPassword with verification code to finish process
	 * @param user Username or cognito user to start process
	 */
	export const forgotPassword = async (user) => {
		// If the username is sent as the "user", fetch the use from the user pool
		if (typeof user === 'string') {
			user = getUserFromUsername(user);
		}

		if (!user || typeof user.forgotPassword !== 'function') {
			throw 'Error, invalid user';
		}

		return new Promise((resolve, reject) => user.forgotPassword({
			onSuccess: resolve,
			onFailure: reject,
		}));
	};

	/**
	 * Finishes reset password flow
	 * @param user Username or cognito user to finish password reset
	 * @param code Code from reset email
	 * @param newPassword Desired new password
	 */
	export const confirmPassword = async (user, code, newPassword) => {
		// If the username is sent as the "user", fetch the use from the user pool
		if (typeof user === 'string') {
			user = getUserFromUsername(user);
		}

		if (!user || typeof user.confirmPassword !== 'function') {
			throw 'Error, invalid user';
		}

		return new Promise((resolve, reject) => user.confirmPassword(code, newPassword, {
			onSuccess: resolve,
			onFailure: reject,
		}));
	};

	/**
	 * result will be an object with user as a key as well as userConfirmed
	 * if userConfirmed is false, you'll need to call  confirmRegistration with
	 * result.user or username and the token received from the user
	 * @param email Desired email
	 * @param password Desired password
	 */
	export const createAccount = async (email, password) => {
		const attrs = [
			new CognitoUserAttribute({
				Name: 'email',
				Value: email,
			}),
		];

		return new Promise((resolve, reject) => userPool.signUp(email, password, attrs, [], (error, result) => {
			if (error) {
				return reject(error);
			}
			resolve(result);
		}));
	};

	/**
	 * Finish registration process. Used when the user has a verification code from the back-end.
	 * @param user Username or cognito user
	 * @param token Verification code from email
	 */
	export const confirmRegistration = async (user, token) => {
		// If the username is sent as the "user", fetch the use from the user pool
		if (typeof user === 'string') {
			user = getUserFromUsername(user);
		}

		if (!user || typeof user.confirmRegistration !== 'function') {
			throw 'Error, invalid user';
		}

		return new Promise(resolve => user.confirmRegistration(token, true, resolve));
	};

	/**
	 * Sends another verification code
	 * @param user Username or cognito user
	 */
	export const resendConfirmationCode = async user => {
		// If the username is sent as the "user", fetch the use from the user pool
		if (typeof user === 'string') {
			user = getUserFromUsername(user);
		}

		if (!user || typeof user.resendConfirmationCode !== 'function') {
			throw 'Error, invalid user';
		}

		return new Promise(resolve => user.resendConfirmationCode(resolve));
	};

	/**
	 * Attempts to login
	 * @param username
	 * @param password
	 */
	export const login = async (username, password) => {
		const authenticationData = {
			Username: username,
			Password: password,
		};

		const authenticationDetails = new AuthenticationDetails(authenticationData);

		const userData = {
			Username: username,
			Pool: userPool,
		};

		const cognitoUser = new CognitoUser(userData);

		return new Promise((resolve, reject) => cognitoUser
			.authenticateUser(authenticationDetails, {
				onSuccess: async (result) => {
					const token = result.getIdToken().getJwtToken();
					await authenticate(token);
					storeRefreshCredentials(username, result.getRefreshToken());
					try {
						await new Promise((resolve, reject) => {
							const syncManager = new CognitoSyncManager();
							syncManager
								.openOrCreateDataset('identityInfo', (err, dataset) => {
									if (err) {
										return reject(err);
									}
									dataset.put('email', username, err => {
										if (err) {
											return reject(err);
										}
										dataset.synchronize({
											onSuccess: resolve,
											onFailure: reject,
										});
									});
								});
						});
					} catch (err) {
						Logger.error('Sync failed', err);
					}
					resolve(cognitoUser);
				},
				onFailure: reject,
			}));
	};

	export const startDevzoneSession = (credentials): Promise<void> => {
		AWS.config.credentials = credentials;
        return new Promise((resolve, reject) => {
            if (AWS.config.credentials) {
                (AWS.config.credentials as any).refresh(error => {
                    if (error) {
                        return reject(error);
                    }
                    resolve();
                });
            } else {
                reject('Credentials undefined');
            }
        });
	};

	export const resumeSession = async (): Promise<void> => {
		const credentials = retrieveRefreshCredentials();
		if (credentials) {
			const userData = {
				Username: credentials.username,
				Pool: userPool,
			};

			const cognitoUser = new CognitoUser(userData);
			const result: any = await new Promise((resolve, reject) => {
				cognitoUser.refreshSession((credentials as any).refreshToken, (err, result) => {
					if (err) {
						return reject(err);
					}
					return resolve(result);
				});
			});
			const token = result.getIdToken().getJwtToken();
			await authenticate(token);
			storeRefreshCredentials(credentials.username, result.getRefreshToken());
			return;
		} else {

			const session = await getUserSession();

			if (session) {
				const token = session.getIdToken().getJwtToken();
				return await authenticate(token);
			}

		}
		throw new Error('No token in storage.');
	};

	export const getUserFromUsername = (username) => {
		const userData = {
			Username: username,
			Pool: userPool,
		};
		return new CognitoUser(userData);
	};

	const authenticate = async (token): Promise<void> => {
		AWS.config.credentials = new CognitoIdentityCredentials({
			IdentityPoolId: COGNITO_IDENTITY_POOL_ID,
			Logins: {
				[USERPOOL_IDP]: token,
			},
		});
		await new Promise((resolve, reject) => {
			if (AWS.config.credentials) {
				(AWS.config.credentials as any).refresh(error => {
					if (error) {
						return reject(error);
					}
					resolve();
				});
			} else {
				reject('Credentials undefined');
			}
		});
	};

	export const userInfo = (): { userName: string, accountId: string, loginExpire: string } => {
		const cognitoUser = userPool.getCurrentUser();
		const credentials = AWS && AWS.config && AWS.config.credentials ? AWS.config.credentials : null;
		if (cognitoUser !== null && credentials) {
			return {
				userName: (cognitoUser as any).username,
				accountId: (credentials as any).data.IdentityId,
				loginExpire: (credentials as any).expireTime.toISOString(),
			};
		}

		if (credentials) { // DevZone login
			return {
				userName: '',
				accountId: (credentials as any).data.IdentityId,
				loginExpire: (credentials as any).expireTime.toISOString(),
			};
		}

		return {
			userName: '',
			accountId: '',
			loginExpire: '',
		};
	};

	export const getSessionExpiryTime = (): Date => {
		return AWS.config.credentials && (AWS.config.credentials as any).expireTime || new Date();
	};

	export async function getJWTToken(): Promise<string | undefined> {

		const session = await getUserSession();
		if (session && session.getIdToken) {
			const idToken = session.getIdToken();
			return idToken.jwtToken;
		}
	}

	function getUserSession(): Promise<any> {
		const currentCognitoUser = userPool.getCurrentUser();
		return new Promise<any>((resolve, reject) => {
			if (
				currentCognitoUser &&
				currentCognitoUser.getSession
			) {
				return currentCognitoUser.getSession((error, session) => {


					if (error) {
						return reject(error);
					}
					resolve(session);
				});
			}
			reject('session not available');
		});
	}

	export async function getRefreshToken(): Promise<string | undefined> {
		const session = await getUserSession();
		if (session && session.getRefreshToken) {
			const refreshToken = session.getRefreshToken();
			return refreshToken.token;
		}
	}

	export function getUsername(): string | undefined {
		const currentCognitoUser = userPool.getCurrentUser();
		if (
			currentCognitoUser &&
			currentCognitoUser.getUsername
		) {
			return currentCognitoUser.getUsername();
		}
	}
}

export default Cognito;
