import { ApolloClient, InMemoryCache } from '@apollo/client';

const client = new ApolloClient({
    uri: 'https://server.cozyb.me/',
    cache: new InMemoryCache(),
  });

export default client