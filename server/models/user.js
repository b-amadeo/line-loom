const { ObjectId } = require("mongodb");
const { getDB } = require("../config/mongo-connection");
const { hash } = require("../utils/bcrypt");

const getCollection = () => {
  const db = getDB();
  return db.collection("Users");
};

const createUser = async (payload) => {
  payload.password = hash(payload.password);
  const collection = getCollection();
  const newUser = await collection.insertOne(payload);
  const user = await collection.findOne(
    { _id: newUser.insertedId },
    { projection: { password: 0 } }
  );
  return user;
};

const findUserByUsername = async (username, options) => {
  const collection = getCollection();
  return await collection.findOne({ username }, options);
};

const findUserByEmail = async (email) => {
  const collection = getCollection();
  return await collection.findOne({ email });
};

const findUserById = async (id = "") => {
  const collection = getCollection("Users");
  const agg = [
    { $match: { _id: new ObjectId(id) } },
    {
      $lookup: {
        from: "Follows",
        localField: "_id",
        foreignField: "followerId",
        as: "following"
      }
    },
    {
      $lookup: {
        from: "Follows",
        localField: "_id",
        foreignField: "followingId",
        as: "followers"
      }
    },
    {
      $project: {
        "password": 0
      }
    }
  ]

  const user = await collection.aggregate(agg).toArray();
  
  return user[0];
};

module.exports = {
  createUser,
  findUserByUsername,
  findUserByEmail,
  findUserById
};
