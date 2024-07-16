import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { ApolloProvider } from '@apollo/client';
import { LoginProvider } from './contexts/LoginContext';
import client from './config/apollo';
import AppStack from './stacks/index';

export default function App() {
  return (
    <ApolloProvider client={client}>
      <LoginProvider>
        <NavigationContainer>
          <AppStack />
        </NavigationContainer>
      </LoginProvider>
    </ApolloProvider>
  );
}