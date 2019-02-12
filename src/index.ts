import AWSAppSyncClient from 'aws-appsync';
import { NonTerminatingLink } from 'aws-appsync/lib/link/non-terminating-link';
import { ApolloClient } from 'apollo-client';

import {
	SubscriptionHandshakeLink,
	CONTROL_EVENTS_KEY,
} from 'aws-appsync/lib/link/subscription-handshake-link';

import { 
	AuthLink, 
	AUTH_TYPE 
} from 'aws-appsync/lib/link/auth-link';

import { 
	ApolloLink, 
	Observable, 
	concat,
	split,
	from 
} from 'apollo-link';

import gql from 'graphql-tag';

import { 
	ApolloConsumer, 
	ApolloProvider, 
	graphql,
	Mutation, 
	Query, 
} from 'react-apollo';


import { 
	InMemoryCache, 
	NormalizedCacheObject 
} from 'apollo-cache-inmemory';

import Cognito from './Cognito';
import { isDevZoneLogin } from './DevzoneHelper';
import { HttpLink } from 'apollo-link-http';
import { onError } from 'apollo-link-error';
import { getMainDefinition } from 'apollo-utilities';

export {
	ApolloClient,
	Cognito, 
	InMemoryCache,
	getMainDefinition,
	isDevZoneLogin, 
	onError,
	NormalizedCacheObject,
	gql,
	// OperationDefinitionNode,
	
	// react-apollo
	ApolloConsumer, 
	ApolloProvider,
	graphql,
	Mutation, 
	Query, 

	// aws-appsync
	AWSAppSyncClient, 
	AuthLink, 
	AUTH_TYPE,
	CONTROL_EVENTS_KEY,
	HttpLink,
	NonTerminatingLink,
	SubscriptionHandshakeLink,

	// apollo-link
	ApolloLink, 
	concat,
	from,
	Observable, 
	split,
};
