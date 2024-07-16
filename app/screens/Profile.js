import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useQuery, useMutation } from "@apollo/client";
import { getUserProfile, followUser } from "../queries/apollo";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Profile = () => {
  const [userId, setUserId] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const route = useRoute();
  const navigation = useNavigation();
  const { _id } = route.params || {};

  useEffect(() => {
    const fetchData = async () => {
      const storedUserId = await AsyncStorage.getItem("userId");
      const storedAccessToken = await AsyncStorage.getItem("accessToken");
      setUserId(storedUserId);
      setAccessToken(storedAccessToken);
    };

    fetchData();
  }, []);

  const { loading, data } = useQuery(getUserProfile, {
    variables: { id: _id || userId },
    skip: !(_id || userId) || !accessToken,
    context: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
    onCompleted: (data) => {
      if (data && data.getUserProfile && data.getUserProfile.data) {
        const { followers } = data.getUserProfile.data;
        setIsFollowing(followers.some(follower => follower._id === userId));
      }
    },
  });

  const [followUserMutation] = useMutation(followUser, {
    context: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
    onCompleted: () => {
      setIsFollowing(true);
    },
    onError: (error) => {
      Alert.alert('Follow Error', error.message);
    },
    refetchQueries: [getUserProfile],
  });

  const handleFollow = async () => {
    await followUserMutation({ variables: { id: _id } });
  };

  if (loading) return <Text>Loading...</Text>;

  const profileData = data?.getUserProfile?.data;
  if (!profileData) return <Text>No profile data found.</Text>;

  const { username, following, followers } = profileData;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Ionicons
            name="arrow-back"
            size={24}
            color="white"
            onPress={() => navigation.goBack()}
          />
          <Text style={styles.headerTitle}>LINE LOOM</Text>
        </View>
        <View style={styles.contentContainer}>
          <View style={styles.iconContainer}>
            <Ionicons name="person-circle-outline" size={100} color="white" />
          </View>
          <Text style={styles.username}>{username}</Text>
          <View style={styles.followContainer}>
            <View style={styles.followSection}>
              <Text style={styles.followCount}>{following}</Text>
              <Text style={styles.followLabel}>Following</Text>
            </View>
            <View style={styles.followSection}>
              <Text style={styles.followCount}>{followers}</Text>
              <Text style={styles.followLabel}>Followers</Text>
            </View>
          </View>
          {_id && _id !== userId && (
            <TouchableOpacity
              style={[
                styles.followButton,
                isFollowing && styles.followingButton,
              ]}
              onPress={handleFollow}
              disabled={isFollowing}
            >
              <Text style={styles.followButtonText}>
                {isFollowing ? "Following" : "Follow"}
              </Text>
            </TouchableOpacity>
          )}
        </View>
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
    backgroundColor: "#111",
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10,
    backgroundColor: "#111",
  },
  headerTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  iconContainer: {
    marginBottom: 20,
  },
  username: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
  followContainer: {
    flexDirection: "row",
    marginTop: 20,
  },
  followSection: {
    alignItems: "center",
    marginHorizontal: 20,
  },
  followCount: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  followLabel: {
    color: "white",
    fontSize: 16,
  },
  followButton: {
    marginTop: 20,
    backgroundColor: "#00c300",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  followingButton: {
    backgroundColor: "gray",
  },
  followButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default Profile;
