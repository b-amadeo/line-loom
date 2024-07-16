if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const { ApolloServer } = require("@apollo/server");
const { startStandaloneServer } = require("@apollo/server/standalone");

const { responseTypeDefs } = require("./schema/response");
const { userTypeDefs, userResolvers } = require("./schema/user");
const { postTypeDefs, postResolvers } = require("./schema/post");
const { followTypeDefs, followResolvers } = require("./schema/follow");

const { connect } = require("./config/mongo-connection");
const authentication = require("./utils/auth");

const port = process.env.PORT || 4000

const server = new ApolloServer({
  typeDefs: [responseTypeDefs, userTypeDefs, postTypeDefs, followTypeDefs],
  resolvers: [userResolvers, postResolvers, followResolvers],
  introspection: true
});

(async () => {
    try {
      await connect();
      const { url } = await startStandaloneServer(server, {
        listen: port,
        context: async ({ req, res }) => {
          return {
            auth: async () => {
              return await authentication(req);
            },
          };
        },
      });
      console.log(`🚀  Server ready at: ${url}`);
    } catch (error) {
      console.error("Error starting server:", error);
    }
  })();
  
