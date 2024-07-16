import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Pilot from "../screens/Pilot";
import Register from "../screens/Register";
import Login from "../screens/Login";
import HomeTabs from "../stacks/HomeTabs";
import AddPost from "../screens/AddPost";
import Profile from "../screens/Profile";
import Detail from "../screens/DetailPost";
import { useContext } from "react";
import { LoginContext } from "../contexts/LoginContext";

const Stack = createNativeStackNavigator();

export default function index() {
  const { isLoggedIn } = useContext(LoginContext);
  return (
    <Stack.Navigator
      initialRouteName={isLoggedIn ? "HomeTabs" : "Pilot"}
      screenOptions={{ headerShown: false }}
    >
      {isLoggedIn ? (
        <>
          <Stack.Screen name="HomeTabs" component={HomeTabs} />
          <Stack.Screen name="AddPost" component={AddPost} />
          <Stack.Screen name="Profile" component={Profile} />
          <Stack.Screen name="Detail" component={Detail} />
        </>
      ) : (
        <>
          <Stack.Screen name="Pilot" component={Pilot} />
          <Stack.Screen name="Register" component={Register} />
          <Stack.Screen name="Login" component={Login} />
        </>
      )}
    </Stack.Navigator>
  );
}
