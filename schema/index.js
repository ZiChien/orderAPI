import { gql } from 'apollo-server'
import { mergeTypeDefs, mergeResolvers } from '@graphql-tools/merge';
import { typeDefs as merchantTypeDefs, resolvers as merchantResolvers } from './merchant.js';
import { typeDefs as menuTypeDefs, resolvers as menuResolvers } from './menu.js';
import { typeDefs as openingHoursTypeDefs, resolvers as openingHoursResolvers } from './openingHours.js';

// The GraphQL schema
const typeDefs = mergeTypeDefs(
    [merchantTypeDefs, menuTypeDefs, openingHoursTypeDefs]
);
const resolvers = mergeResolvers(
    [merchantResolvers, menuResolvers, openingHoursResolvers]
);


export { typeDefs, resolvers };