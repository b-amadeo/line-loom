import React, { useState, useEffect } from "react";
import { View, Text, Modal, StyleSheet, TouchableOpacity, FlatList, Dimensions, TextInput, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useMutation } from "@apollo/client";
import { postComment, showPosts } from "../queries/apollo";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { height, width } = Dimensions.get('screen');

const CommentsModal = ({ visible, comments, onClose, postId }) => {
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

  const [createComment] = useMutation(postComment, {
    context: {
      headers: {
        authorization: accessToken ? `Bearer ${accessToken}` : '',
      },
    },
    refetchQueries: [showPosts]
  });

  const handleComment = async () => {
    if (!inputText.trim()) {
      Alert.alert("Error", "Comment cannot be empty.");
      return;
    }

    try {
      const { data } = await createComment({ variables: { postId, content: inputText } });
      console.log("Comment submitted:", data);
      setInputText("");
    } catch (error) {
      console.error("Error submitting comment:", error);
      Alert.alert("Error", "Failed to submit comment. Please try again later.");
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Comments</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
          </View>
          <FlatList
            inverted
            style={styles.commentsContainer}
            data={comments}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <View style={styles.commentContainer}>
                <View style={styles.comment}>
                  <Ionicons name="person-circle-outline" size={40} color="white" />
                  <View style={styles.commentText}>
                    <Text style={styles.username}>{item.username}</Text>
                    <Text style={styles.commentContent}>{item.content}</Text>
                  </View>
                </View>
              </View>
            )}
            ListEmptyComponent={
              <View style={styles.noCommentsContainer}>
                <Text style={styles.noComments}>Be the first to leave a comment!</Text>
              </View>
            }
          />
        </View>
        <View style={styles.staticCommentInputContainer}>
          <Ionicons name="person-circle-outline" size={30} color="white" />
          <TextInput
            style={styles.commentInput}
            placeholder="Say something"
            placeholderTextColor="gray"
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={handleComment}
          />
          <TouchableOpacity onPress={handleComment} style={styles.commentButton}>
            <Ionicons name="send" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#000",
    padding: 20,
    marginTop: height / 2,
    borderRadius: 20,
    height: (3 / 4) * height,
    width: width,
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
  },
  commentsContainer: {
    flex: 1,
    marginBottom: 175
  },
  commentContainer: {
    marginBottom: 10,
  },
  comment: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
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
  staticCommentInputContainer: {
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
  noCommentsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noComments: {
    color: "white",
    textAlign: "center",
  },
});

export default CommentsModal;
