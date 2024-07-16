const { GraphQLError } = require("graphql");
const { followUser, findFollowing } = require("../models/follow");
const { ObjectId } = require("mongodb");

const followTypeDefs = `#graphql
type Follow {
    _id: ID!
    followingId: ID!
    followerId: ID!
    createdAt: String
    updatedAt: String
}

type Mutation {
    followUser(_id: String): FollowUserResponse
}
`;

const followResolvers = {
    Mutation: {
        followUser: async(_, args, contextValue) => {
            const userLogin = await contextValue.auth()
            const { _id } = args
            const followingId = new ObjectId(_id)
            const followerId = new ObjectId(userLogin._id)

            const following = await findFollowing({ followerId, followingId})
            if (following) {
              throw new GraphQLError("You are already following this user", {
                extensions: {
                  http: {
                    status: 400,
                  },
                },
              });
            }

            const createdAt = new Date().toISOString();
            const updatedAt = new Date().toISOString();
      
            const follow = {
              followingId,
              followerId,
              createdAt,
              updatedAt,
            };

            const insertedFollow = await followUser(follow)
      
            return {
              statusCode: 200,
              message: "User followed successful",
              data: insertedFollow
            }
          }
    }
}

module.exports = { followTypeDefs, followResolvers }