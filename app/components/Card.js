import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, Image, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useMutation } from "@apollo/client";
import { postLike, showPosts } from "../queries/apollo";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Card = ({ post, isLiked, onCommentPress, navigation }) => {
  const [localLikes, setLocalLikes] = useState(post.likes?.length || 0);
  const [localIsLiked, setLocalIsLiked] = useState(isLiked);
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

  const [postLikeMutation] = useMutation(postLike, {
    context: {
      headers: {
        authorization: accessToken ? `Bearer ${accessToken}` : "",
      },
    },
    refetchQueries: [showPosts]
  });

  const handleLikePress = async () => {
    if (!accessToken) {
      Alert.alert("Authorization Error", "Access token not found. Please log in again.");
      return;
    }

    try {
      const { data } = await postLikeMutation({ variables: { postId: post?._id } });
      const updatedLikes = localIsLiked ? localLikes - 1 : localLikes + 1;
      setLocalLikes(updatedLikes);
      setLocalIsLiked(!localIsLiked);
    } catch (error) {
      Alert.alert('Error', error.networkError.result.errors[0].message);
    }
  };

  if (!post) {
    return null;
  }

  return (
    <View style={styles.post}>
      <Text style={styles.postTitle}>{post.author?.username}</Text>
      <TouchableOpacity onPress={() => navigation.navigate("Detail", { postId: post._id })}>
        <Image source={{ uri: post.imgUrl }} style={styles.postImage} />
      </TouchableOpacity>
      <Text style={styles.postDescription}>{post.content}</Text>
      <View style={styles.actions}>
        <TouchableOpacity onPress={handleLikePress} style={styles.actionButton}>
          <Ionicons
            name={localIsLiked ? "heart" : "heart-outline"}
            size={24}
            color={localIsLiked ? "red" : "white"}
          />
          <Text style={styles.actionText}>{localLikes}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onCommentPress(post._id)} style={styles.actionButton}>
          <Ionicons
            name={"chatbox-outline"}
            size={24}
            color={"white"}
          />
          <Text style={styles.actionText}>{post.comments?.length || 0}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  post: {
    backgroundColor: "#222",
    margin: 10,
    borderRadius: 10,
    padding: 10,
  },
  postTitle: {
    color: "green",
    fontSize: 16,
    fontWeight: "bold",
  },
  postImage: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginVertical: 10,
  },
  postDescription: {
    color: "white",
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 20,
  },
  actionText: {
    color: "white",
    marginLeft: 5,
  },
});

export default Card;
