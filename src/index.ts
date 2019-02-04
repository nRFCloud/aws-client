import AWSAppSyncClient from 'aws-appsync';
import Cognito from './Cognito';
import { isDevZoneLogin } from './DevzoneHelper';
import { ApolloProvider, ApolloConsumer, Query, Mutation, graphql } from 'react-apollo';
import gql from 'graphql-tag';

export {
	AWSAppSyncClient,
	Cognito,
	isDevZoneLogin,
	ApolloConsumer,
	ApolloProvider,
	Query,
	Mutation,
	graphql,
	gql
};
