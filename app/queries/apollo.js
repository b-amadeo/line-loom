import { gql } from "@apollo/client";

export const register = gql`
  mutation Register($payload: RegisterInput) {
    register(payload: $payload) {
      statusCode
      message
      data {
        name
        username
        email
      }
    }
  }
`;

export const login = gql`
  mutation login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      statusCode
      message
      data {
        id
        access_token
      }
    }
  }
`;

export const showPosts = gql`
  query getPosts {
    getPosts {
      statusCode
      message
      data {
        _id
        content
        tags
        imgUrl
        authorId
        comments {
          content
          username
          createdAt
          updatedAt
        }
        likes {
          username
          createdAt
          updatedAt
        }
        createdAt
        updatedAt
        author {
          name
          username
          email
          password
        }
      }
    }
  }
`;

export const postCreate = gql`
  mutation postCreate($input: PostCreateInput) {
    postCreate(input: $input) {
      statusCode
      message
      data {
        _id
        content
        tags
        imgUrl
        authorId
        createdAt
        updatedAt
      }
    }
  }
`;

export const searchUsername = gql`
  query searchUsername($username: String!) {
    searchUsername(username: $username) {
      statusCode
      data {
        _id
        name
        username
        email
      }
    }
  }
`;

export const getUserProfile = gql`
  query getUserProfile($id: ID!) {
    getUserProfile(_id: $id) {
      statusCode
      message
      data {
        _id
        name
        username
        email
        following
        followers
      }
    }
  }
`;

export const getPostById = gql`
  query getPostById($id: ID!) {
    getPostById(_id: $id) {
      statusCode
      message
      data {
        _id
        content
        tags
        imgUrl
        authorId
        comments {
          content
          username
          createdAt
          updatedAt
        }
        likes {
          username
          createdAt
          updatedAt
        }
        createdAt
        updatedAt
        author {
          _id
          name
          username
          email
          password
        }
      }
    }
  }
`;

export const postLike = gql`
  mutation postLike($postId: String) {
    postLike(postId: $postId) {
      statusCode
      message
      data {
        username
        createdAt
        updatedAt
      }
    }
  }
`;

export const postComment = gql`
  mutation postComment($postId: String, $content: String) {
    commentCreate(postId: $postId, content: $content) {
      statusCode
      message
      data {
        content
        username
        createdAt
        updatedAt
      }
    }
  }
`;

export const followUser = gql`
  mutation followUser($id: String) {
    followUser(_id: $id) {
      statusCode
      message
      data {
        followingId
        followerId
        createdAt
        updatedAt
      }
    }
  }
`;
