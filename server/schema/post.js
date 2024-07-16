const { GraphQLError } = require("graphql");
const { createPost, findAllPost, createComment, findPostById, likePost } = require("../models/post");
const { ObjectId } = require("mongodb");
const redis = require("../config/redis");

const postTypeDefs = `#graphql
type Post {
    _id: ID!
    content: String!
    tags: [String]
    imgUrl: String
    authorId: ID!
    comments: [Comment]
    likes: [Like]
    createdAt: String
    updatedAt: String
    author: User
  }

  input PostCreateInput {
    content: String!
    tags: [String]
    imgUrl: String
  }
  
  type Comment {
    content: String!
    username: String
    createdAt: String
    updatedAt: String
  }
  
  type Like {
    username: String!
    createdAt: String
    updatedAt: String
  }

  type Query {
    getPosts: PostShowResponse
    getPostById(_id: ID!): PostShowByIdResponse
  }

  type Mutation {
    commentCreate(postId: String, content: String): CommentCreateResponse
    postCreate(input: PostCreateInput): PostCreateResponse
    postLike(postId: String): PostLikeResponse
  }
`;

const postResolvers = {
  Query: {
    getPosts: async (_, __, contextValue) => {
      const postCache = await redis.get("posts:all")

      if(postCache){
        return {
          statusCode: 200,
          message: "Success read all posts",
          data: JSON.parse(postCache)
        }
      }

      const userLogin = await contextValue.auth();

      const posts = await findAllPost();

      await redis.set("posts:all", JSON.stringify(posts))

      return {
        statusCode: 200,
        message: "Success read all posts",
        data: posts
      }
    },

    getPostById: async(_, args, contextValue) => {
      const userLogin = await contextValue.auth()
      const { _id } = args

      const post = await findPostById(_id)

      return {
        statusCode: 200,
        message: `Find post ${_id} successfull`,
        data: post
      }
    }
  },

  Mutation: {
    postCreate: async (_, args, contextValue) => {
      const userLogin = await contextValue.auth();

      const { input } = args;
      let { content, tags, imgUrl } = input;

      const authorId = userLogin._id;
      const comments = []
      const likes = []
      const createdAt = new Date().toISOString();
      const updatedAt = new Date().toISOString();

      if (!content) {
        throw new GraphQLError("Content must be filled", {
          extensions: {
            http: {
              status: 400
            }
          }
        });
      }

      const newPost = await createPost({
        content,
        tags,
        imgUrl,
        authorId,
        comments,
        likes,
        createdAt,
        updatedAt,
      });

      await redis.del("posts:all")

      return {
        statusCode: 200,
        message: `Post Added Successfully`,
        data: newPost,
      };
    },

    commentCreate: async (_, args, contextValue) => {
      const userLogin = await contextValue.auth();
      const { postId, content } = args;
      const username = userLogin.username;
      const createdAt = new Date().toISOString();
      const updatedAt = new Date().toISOString();

      const comment = {
        content,
        username,
        createdAt,
        updatedAt,
      };

      const filter = { _id: new ObjectId(postId) };
      const update = { $push: { comments: comment } };

      const data = await createComment(filter, update);
      
      const lastComment = data.comments[data.comments.length - 1]

      await redis.del("posts:all")

      return {
        statusCode: 200,
        message: "Comment created successfully",
        data: lastComment
      }
    },

    postLike: async(_, args, contextValue) => {
      const userLogin = await contextValue.auth()
      const { postId } = args
      const username = userLogin.username;
      const createdAt = new Date().toISOString();
      const updatedAt = new Date().toISOString();

      const post = await findPostById(postId);
      if (!post) {
        throw new GraphQLError("Post is not found", {
          extensions: {
            http: {
              status: 400
            }
          }
        });
      }

      const likedPost = post.likes.find(l => l.username === username);
      if (likedPost) {
        throw new GraphQLError("You have already liked this post", {
          extensions: {
            http: {
              status: 400
            }
          }
        });
      }

      const like = {
        username,
        createdAt,
        updatedAt,
      };

      const filter = { _id: new ObjectId(postId) };
      const update = { $push: { likes: like } };

      const data = await likePost(filter, update);
      
      const lastLike = data.likes[data.likes.length - 1]

      await redis.del("posts:all")

      return {
        statusCode: 200,
        message: "Liked successfully",
        data: lastLike
      }
    }
  },
};

module.exports = { postTypeDefs, postResolvers };
