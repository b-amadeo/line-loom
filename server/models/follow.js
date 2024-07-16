const { getDB } = require("../config/mongo-connection");

const getCollection = () => {
  const db = getDB();
  return db.collection("Follows");
};

const followUser = async (follow) => {
  const collection = getCollection()

  const newFollow = await collection.insertOne(follow);
  const insertedFollow = await collection.findOne({ _id: newFollow.insertedId });

  return insertedFollow;
};

const findFollowing = async ({ followerId, followingId }) =>  {
  const collection = getCollection()

  const follow = await collection.findOne({ followerId, followingId })
  return follow
}

module.exports = {
  followUser,
  findFollowing
};
