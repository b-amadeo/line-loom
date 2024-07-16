const { GraphQLError } = require("graphql");
const { verifyToken } = require("./jwt");
const { findUserById } = require("../models/user");

const authentication = async (req) => {
  const authorization = req.headers.authorization;

  if (!authorization) {
    throw new GraphQLError("Invalid token", {
      extensions: {
        http: {
          status: 401,
        },
      },
    });x``
  }

  const access_token = authorization.split(" ")[1];

  if (!access_token) {
    throw new GraphQLError("Invalid token", {
      extensions: {
        http: {
          status: 401,
        },
      },
    });
  }

  const decodedToken = verifyToken(access_token);

  const user = await findUserById(decodedToken.id);

  delete user.password;

  return user;
};

module.exports = authentication;
