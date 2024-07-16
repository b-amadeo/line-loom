const { GraphQLError } = require("graphql");
const {
  createUser,
  findUserByUsername,
  findUserByEmail,
  findUserById
} = require("../models/user");
const { compare } = require("../utils/bcrypt");
const { signToken } = require("../utils/jwt");

const typeDefs = `#graphql
  type User {
    _id: ID!
    name: String!
    username: String!
    email: String!
    password: String
    following: Int
    followers: Int
  }

  input RegisterInput {
    name: String!
    username: String!
    email: String!
    password: String!
  }

  type Query {
    searchUsername(username: String!): UsernameSearchResponse
    getUserProfile(_id: ID!): UserProfileResponse
  }

  type Mutation {
    register(payload: RegisterInput): UserRegisterResponse
    login(username: String!, password: String!): UserLoginResponse
  }
`;

const resolvers = {
  Query: {
    searchUsername: async (_, args, contextValue) => {
      const userLogin = await contextValue.auth();
      const { username } = args;
      const foundUsername = await findUserByUsername(username, {
        projection: { password: 0 },
      });
      if (!foundUsername) {
        throw new GraphQLError("User not found", {
          extensions: {
            http: {
              status: 400,
            },
          },
        });
      }
      return {
        statusCode: 200,
        data: foundUsername,
      };
    },

    getUserProfile: async (_, args, contextValue) => {
      const userLogin = await contextValue.auth();
      const { _id } = args
      const user = await findUserById(_id);

      if (!user) {
        throw new GraphQLError("User not found", {
          extensions: {
            http: {
              status: 400,
            },
          },
        });
      }

      return {
        statusCode: 200,
        message: "User profile retrieved successfully",
        data: {
          _id: user._id,
          name: user.name,
          username: user.username,
          email: user.email,
          following: user.following.length,
          followers: user.followers.length
        }
      };
    }
  },

  Mutation: {
    register: async (_, args) => {
      const { payload } = args;
      const existingUsername = await findUserByUsername(payload.username);
      if (existingUsername) {
        throw new GraphQLError("Username must be unique", {
          extensions: {
            http: {
              status: 400,
            },
          },
        });
      }

      const existingEmail = await findUserByEmail(payload.email);
      if (existingEmail) {
        throw new GraphQLError("Email must be unique", {
          extensions: {
            http: {
              status: 400,
            },
          },
        });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(payload.email)) {
        throw new GraphQLError("Invalid email format", {
          extensions: {
            http: {
              status: 400,
            },
          },
        });
      }

      if (payload.password.length < 5) {
        throw new GraphQLError(
          "Minimum password length should be 5 characters",
          {
            extensions: {
              http: {
                status: 400,
              },
            },
          }
        );
      }

      const newUser = await createUser(payload);
      return {
        statusCode: 200,
        message: "New user created successfully",
        data: {
          name: newUser.name,
          username: newUser.username,
          email: newUser.email,
        },
      };
    },
    login: async (_, { username, password }) => {
      const user = await findUserByUsername(username);
      if (!user || !(await compare(password, user.password))) {
        throw new GraphQLError("Invalid username or password", {
          extensions: {
            http: {
              status: 400,
            },
          },
        });
      }

      const payload = {
        id: user._id,
        username: user.username,
        email: user.email,
      };

      const id = user._id.toString()

      const access_token = signToken(payload);

      return {
        statusCode: 200,
        message: "Login Successful",
        data: {
          id,
          access_token,
        },
      };
    },
  }
};

module.exports = {
  userTypeDefs: typeDefs,
  userResolvers: resolvers,
};
