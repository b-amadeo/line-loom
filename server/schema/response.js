const responseTypeDefs = `#graphql
  interface Response {
    statusCode: String!
    message: String
    error: String
  }

  type UserLoginData {
    id: ID!
    access_token: String
  }

  type UserLoginResponse implements Response {
    statusCode: String!
    message: String
    error: String
    data: UserLoginData
  }

  type UserRegisterResponse implements Response {
    statusCode: String!
    message: String
    error: String
    data: User
  }

  type PostShowResponse implements Response {
    statusCode: String!
    message: String
    error: String
    data: [Post]
  }

  type PostShowByIdResponse implements Response {
    statusCode: String!
    message: String
    error: String
    data: Post
  }

  type PostCreateResponse implements Response {
    statusCode: String!
    message: String
    error: String
    data: Post
  }

  type CommentCreateResponse implements Response {
    statusCode: String!
    message: String
    error: String
    data: Comment
  }

  type UsernameSearchResponse implements Response {
    statusCode: String!
    message: String
    error: String
    data: User
  }

  type PostLikeResponse implements Response {
    statusCode: String!
    message: String
    error: String
    data: Like
  }

  type FollowUserResponse implements Response {
    statusCode: String!
    message: String
    error: String
    data: Follow
  }

  type UserProfileResponse implements Response {
    statusCode: String!
    message: String
    error: String
    data: User
  }
  `;

module.exports = { responseTypeDefs };
