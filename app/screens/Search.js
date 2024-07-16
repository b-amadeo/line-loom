import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLazyQuery } from "@apollo/client";
import { searchUsername } from "../queries/apollo";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Search = ({ navigation }) => {
  const [searchText, setSearchText] = useState("");
  const [accessToken, setAccessToken] = useState(null);

  useEffect(() => {
    const getAccessToken = async () => {
      try {
        const token = await AsyncStorage.getItem("accessToken");
        setAccessToken(token);
      } catch (error) {
        console.error("Error retrieving access token:", error);
      }
    };

    getAccessToken();
  }, []);

  const [searchUser, { data: searchData, error }] = useLazyQuery(
    searchUsername,
    {
      context: {
        headers: {
          authorization: accessToken ? `Bearer ${accessToken}` : "",
        },
      },
      onError: (error) => {
        Alert.alert("Search Error", error.graphQLErrors[0].message);
      },
    }
  );

  const handleSearch = async () => {
    if (searchText && accessToken) {
      await searchUser({
        variables: { username: searchText },
      });
    }
  };

  const handleProfileNavigate = (_id) => {
    navigation.navigate("Profile", { _id });
  };

  const renderFlatList = () => {
    if (
      searchData &&
      searchData.searchUsername &&
      searchData.searchUsername.data
    ) {
      const dataArray = Array.isArray(searchData.searchUsername.data)
        ? searchData.searchUsername.data
        : [searchData.searchUsername.data];
      return (
        <FlatList
          data={dataArray}
          keyExtractor={(item) => item.username}
          renderItem={({ item }) => {
            return (
              <View style={styles.searchItem}>
                <TouchableOpacity
                  onPress={() => handleProfileNavigate(item._id)}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    flex: 1,
                  }}
                >
                  <Ionicons
                    name="person-circle-outline"
                    size={24}
                    color="white"
                  />
                  <Text style={styles.searchItemText}>{item.name}</Text>
                </TouchableOpacity>
              </View>
            );
          }}
        />
      );
    }
    return null;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Search</Text>
        </View>

        <View style={styles.searchContainer}>
          <TouchableOpacity onPress={() => setSearchText("")}>
            <Ionicons name="close" size={18} color="white" />
          </TouchableOpacity>
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            placeholderTextColor="gray"
            value={searchText}
            onChangeText={(text) => setSearchText(text)}
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity onPress={handleSearch}>
            <Ionicons name="search" size={20} color="gray" />
          </TouchableOpacity>
        </View>

        {renderFlatList()}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#000",
  },
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    backgroundColor: "#111",
  },
  headerTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#111",
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    marginRight: 10,
    color: "white",
    borderBottomWidth: 1,
    borderBottomColor: "gray",
    padding: 5,
  },
  searchItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#222",
  },
  searchItemText: {
    flex: 1,
    marginLeft: 10,
    color: "white",
  },
});

export default Search;
