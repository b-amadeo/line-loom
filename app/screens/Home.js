import React, { useContext, useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, View, TouchableOpacity, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@apollo/client";
import { LoginContext } from "../contexts/LoginContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { showPosts } from "../queries/apollo";
import Card from "../components/Card";
import CommentsModal from "../components/CommentsModal";
import client from "../config/apollo";

const Home = ({ navigation }) => {
  const { setIsLoggedIn } = useContext(LoginContext);
  const [accessToken, setAccessToken] = useState(null);
  const [commentedPostId, setCommentedPostId] = useState(null);

  useEffect(() => {
    const fetchAccessToken = async () => {
      const storedAccessToken = await AsyncStorage.getItem("accessToken");
      setAccessToken(storedAccessToken);
    };

    fetchAccessToken();
  }, []);

  const { loading, error, data } = useQuery(showPosts, {
    context: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });

  const currentTime = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  const [likedPosts, setLikedPosts] = useState({});
  const [commentedPosts, setCommentedPosts] = useState({});
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  const handleAddPost = () => {
    navigation.navigate("AddPost");
  };

  const handleProfile = () => {
    navigation.navigate("Profile");
  };

  const handleCommentPress = (postId) => {
    setCommentedPostId(postId);
    setCommentedPosts((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  const toggleLogoutModal = () => {
    setLogoutModalVisible(!logoutModalVisible);
  };

  const handleLogout = async () => {
    setLogoutModalVisible(false);
    setTimeout(async () => {
      await AsyncStorage.clear();
      client.clearStore();
      setIsLoggedIn(false);
    }, 500); 
  };

  if (loading) return <Text>Loading...</Text>;
  if (error) return <Text>Error: {error.message}</Text>;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.time}>{currentTime}</Text>
          <Text style={styles.headerTitle}>LINE LOOM</Text>
          <View style={styles.headerIcons}>
            <Ionicons name="add-outline" onPress={handleAddPost} size={24} color="white" />
            <Ionicons name="person-outline" onPress={handleProfile} size={24} color="white" />
            <TouchableOpacity onPress={toggleLogoutModal}>
              <Ionicons name="log-out-outline" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        <FlatList
          data={data.getPosts.data}
          keyExtractor={(post) => post._id}
          renderItem={({ item: post }) => (
            <Card
              key={post._id}
              post={post}
              isLiked={!!likedPosts[post._id]}
              onCommentPress={() => handleCommentPress(post._id)}
              navigation={navigation}
            />
          )}
          style={styles.content}
        />

        <Modal
          visible={logoutModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={toggleLogoutModal}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalText}>Are you sure you want to logout?</Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.modalButton} onPress={toggleLogoutModal}>
                  <Text style={styles.buttonText}>No</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalButton} onPress={handleLogout}>
                  <Text style={styles.buttonText}>Yes</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {commentedPostId && (
          <CommentsModal
            visible={commentedPosts[commentedPostId]}
            comments={data.getPosts.data.find((post) => post._id === commentedPostId)?.comments || []}
            onClose={() => setCommentedPostId(null)}
            postId={commentedPostId}
          />
        )}
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
    justifyContent: "space-between",
    padding: 10,
    backgroundColor: "#111",
  },
  time: {
    color: "white",
    fontSize: 18,
  },
  headerTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginRight: -50,
  },
  headerIcons: {
    flexDirection: "row",
    gap: 15,
  },
  content: {
    flex: 1,
    backgroundColor: "#111",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
  },
  modalText: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: "center",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "center",
  },
  modalButton: {
    backgroundColor: "#007BFF",
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default Home;
