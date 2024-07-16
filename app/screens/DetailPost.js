import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  FlatList,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useQuery, useMutation } from "@apollo/client";
import { getPostById, postComment, showPosts } from "../queries/apollo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

const Detail = ({ route }) => {
  const { postId } = route.params;
  const navigation = useNavigation();
  const [comments, setComments] = useState([]);
  const [inputText, setInputText] = useState("");
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

  const { loading, data, refetch } = useQuery(getPostById, {
    variables: { id: postId },
    skip: !accessToken,
    context: {
      headers: {
        authorization: accessToken ? `Bearer ${accessToken}` : "",
      },
    },
  });

  useEffect(() => {
    if (accessToken) {
      refetch();
    }
  }, [accessToken]);

  useEffect(() => {
    if (data && data.getPostById && data.getPostById.data) {
      setComments(data.getPostById.data.comments);
    }
  }, [data]);

  const [createComment] = useMutation(postComment, {
    context: {
      headers: {
        authorization: accessToken ? `Bearer ${accessToken}` : "",
      },
    },
    refetchQueries: [showPosts],
  });

  const handleComment = async () => {
    await createComment({ variables: { postId, content: inputText } });
    setInputText("");
  };

  if (loading) return <Text>Loading...</Text>;

  if (!data || !data.getPostById || !data.getPostById.data) {
    return <Text>No post data found.</Text>;
  }

  const post = data.getPostById.data;

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
        <View style={styles.post}>
          <Text style={styles.postTitle}>{post.author?.username}</Text>
          <Image source={{ uri: post.imgUrl }} style={styles.postImage} />
          <Text style={styles.postDescription}>{post.content}</Text>
          <View style={styles.tagsContainer}>
            {post.tags?.map((tag, index) => (
              <Text key={index} style={styles.tag}>{`#${tag}`}</Text>
            ))}
          </View>
        </View>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Comments</Text>
        </View>
        <FlatList
          inverted
          style={styles.commentsContainer}
          data={comments}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={styles.commentContainer}>
              <Ionicons name="person-circle-outline" size={40} color="white" />
              <View style={styles.commentText}>
                <Text style={styles.username}>{item.username}</Text>
                <Text style={styles.commentContent}>{item.content}</Text>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.noCommentsContainer}>
              <Text style={styles.noComments}>
                Be the first to leave a comment!
              </Text>
            </View>
          }
        />
        <View style={styles.commentInputContainer}>
          <Ionicons name="person-circle-outline" size={30} color="white" />
          <TextInput
            style={styles.commentInput}
            placeholder="Say something"
            placeholderTextColor="gray"
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={handleComment}
          />
          <TouchableOpacity
            onPress={handleComment}
            style={styles.commentButton}
          >
            <Ionicons name="send" size={24} color="white" />
          </TouchableOpacity>
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
    backgroundColor: "#000",
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
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
    marginRight: -5,
    alignSelf: "flex-end",
  },
  tag: {
    backgroundColor: "#333",
    color: "white",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    marginRight: 5,
    marginBottom: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    paddingLeft: 10,
  },
  commentsContainer: {
    flex: 1,
    marginBottom: 82,
  },
  commentContainer: {
    flexDirection: "row",
    alignItems: "center",
    margin: 10,
  },
  commentText: {
    marginLeft: 10,
  },
  username: {
    color: "white",
    fontWeight: "bold",
  },
  commentContent: {
    color: "white",
  },
  noCommentsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noComments: {
    color: "white",
    textAlign: "center",
  },
  commentInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#000",
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: "white",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  commentInput: {
    flex: 1,
    marginLeft: 10,
    color: "white",
    borderWidth: 1,
    borderColor: "white",
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  commentButton: {
    marginLeft: 10,
  },
});

export default Detail;
