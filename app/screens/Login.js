import React, { useContext, useState } from 'react';
import { StyleSheet, Text, TextInput, View, TouchableOpacity, Alert } from 'react-native';
import { useMutation } from '@apollo/client';
import { login } from '../queries/apollo';
import { LoginContext } from "../contexts/LoginContext";
import AsyncStorage from '@react-native-async-storage/async-storage';

const Login = ({ navigation }) => {
  const { setIsLoggedIn } = useContext(LoginContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [loginUser] = useMutation(login, {
    onCompleted: async (data) => {
      const user = data.login.data;
      const id = user.id;
      const accessToken = user.access_token;

      await AsyncStorage.setItem('userId', id);
      await AsyncStorage.setItem('accessToken', accessToken);

      setIsLoggedIn(true);
    },
    onError: (error) => {
      Alert.alert('Login Error', error.networkError.result.errors[0].message);
    }
  });

  const handleLogin = () => {
    loginUser({ variables: { username, password } });
  };


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      {/* Navigation to Register */}
      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.link}>Doesn't have an account? Register here!</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#00c300',
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: '#000000',
    borderWidth: 1,
    borderRadius: 25,
    padding: 10,
    marginBottom: 15,
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#00c300',
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  link: {
    marginTop: 20,
    color: '#00c300',
  },
});

export default Login;
