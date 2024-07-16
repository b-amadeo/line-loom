const { ObjectId } = require("mongodb");
const { getDB } = require("../config/mongo-connection");

const getCollection = () => {
  const db = getDB();
  return db.collection("Posts");
};

const createPost = async (payload) => {
  const collection = getCollection();
  const newPost = await collection.insertOne(payload);

  const post = await collection.findOne({
    _id: new ObjectId(newPost.insertedId),
  });

  return post;
};

const findAllPost = async () => {
  const agg = [
    {
      $lookup: {
        from: "Users",
        localField: "authorId",
        foreignField: "_id",
        as: "author",
      },
    },
    {
      $unwind: {
        path: "$author",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
    {
      $project: {
        "author.password": 0,
      },
    },
  ];

  const posts = await getCollection().aggregate(agg).toArray();

  return posts;
};

const createComment = async (filter, update) => {
  const collection = getCollection()

  await collection.updateOne(filter, update);

  const updatedPost = await collection.findOne(filter);
  return updatedPost;
}

const findPostById = async (_id = "") => {
  const collection = getCollection();
  const agg = [
    { $match: { _id: new ObjectId(_id) } },
    {
      $lookup: {
        from: "Users",
        localField: "authorId",
        foreignField: "_id",
        as: "author",
      },
    },
    {
      $unwind: {
        path: "$author",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        "author.password": 0,
      },
    },
  ];

  const post = await collection.aggregate(agg).toArray();

  return post[0];
}

const likePost = async (filter, update) => {
  const collection = getCollection()

  await collection.updateOne(filter, update);

  const updatedPost = await collection.findOne(filter);
  return updatedPost;
}

module.exports = {
  createPost,
  findAllPost,
  createComment,
  findPostById,
  likePost
};
