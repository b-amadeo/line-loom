import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useMutation, gql } from "@apollo/client";
import { SafeAreaView } from "react-native-safe-area-context";
import { postCreate, showPosts } from "../queries/apollo";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AddPost = () => {
  const navigation = useNavigation();
  const [content, setContent] = useState("");
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [imgUrl, setImgUrl] = useState("");
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

  const [createPost, { loading }] = useMutation(postCreate, {
    onCompleted: () => {
      setContent("");
      setTags([]);
      setImgUrl("");
    },
    onError: (error) => {
      Alert.alert("Error", error.networkError.result.errors[0].message);
    },
    context: {
      headers: {
        authorization: accessToken ? `Bearer ${accessToken}` : "",
      },
    },
    refetchQueries: [showPosts]
  });

  const handleAddTag = () => {
    if (tagInput.trim() !== "" && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (index) => {
    const newTags = [...tags];
    newTags.splice(index, 1);
    setTags(newTags);
  };

  const handleSubmit = () => {
    const input = {
      content,
      tags,
      imgUrl,
    };

    createPost({ variables: { input } });
    navigation.navigate("Home")
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Ionicons name="arrow-back" size={24} color="white" onPress={() => navigation.goBack()} />
          <Text style={styles.headerTitle}>LINE LOOM</Text>
        </View>
        <View style={styles.formContainer}>
          <Text style={styles.inputTitle}>Add Post</Text>
          <TextInput
            placeholder="Content"
            placeholderTextColor="#aaa"
            value={content}
            onChangeText={setContent}
            style={styles.input}
            multiline
            numberOfLines={4}
          />
          <View style={styles.tagContainer}>
            <TextInput
              placeholder="Add Tags"
              placeholderTextColor="#aaa"
              value={tagInput}
              onChangeText={setTagInput}
              onSubmitEditing={handleAddTag}
              style={[styles.input, styles.tagInput]}
            />
            <TouchableOpacity onPress={handleAddTag}>
              <Ionicons name="add-circle-outline" size={24} color="#00c300" />
            </TouchableOpacity>
          </View>
          <View style={styles.tags}>
            {tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
                <TouchableOpacity onPress={() => handleRemoveTag(index)}>
                  <Ionicons name="close-circle" size={16} color="red" style={styles.tagIcon} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
          <TextInput
            placeholder="Image URL"
            placeholderTextColor="#aaa"
            value={imgUrl}
            onChangeText={setImgUrl}
            style={styles.input}
          />
          <TouchableOpacity
            onPress={handleSubmit}
            style={[styles.submitButton, loading ? styles.submitButtonDisabled : null]}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>{loading ? 'Adding...' : 'Add Post'}</Text>
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
  formContainer: {
    flex: 1,
    justifyContent: "center",
  },
  inputTitle: {
    color: "white",
    marginBottom: 25,
    fontSize: 30,
    fontWeight: "bold"
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: "gray",
    marginBottom: 10,
    paddingVertical: 5,
    color: "white",
  },
  tagContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  tagInput: {
    flex: 1,
    marginRight: 10,
  },
  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 10,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 5,
    marginBottom: 5,
    backgroundColor: "#333",
    padding: 5,
    borderRadius: 10,
  },
  tagText: {
    color: "white",
    marginRight: 5,
  },
  tagIcon: {
    marginLeft: 5,
  },
  submitButton: {
    backgroundColor: "#00c300",
    padding: 10,
    borderRadius: 5,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: "white",
    textAlign: "center",
  },
});

export default AddPost;
