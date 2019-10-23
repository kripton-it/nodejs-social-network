const postsCollection = require("../db")
  .db()
  .collection("posts");
const { ObjectID } = require("mongodb");
const User = require("./User");

const Post = function(data, userid) {
  this.data = data;
  this.userid = userid;
  this.errors = [];
};

Post.prototype.create = function() {
  return new Promise(async (resolve, reject) => {
    try {
      this.cleanup();
      this.validate();
      if (!this.errors.length) {
        await postsCollection.insertOne(this.data);
        resolve();
      } else {
        reject(this.errors);
      }
    } catch (error) {
      this.errors.push("Please try again later");
      reject(this.errors);
    }
  });
};

Post.prototype.cleanup = function() {
  if (typeof this.data.title !== "string") {
    this.data.title = "";
  }

  if (typeof this.data.body !== "string") {
    this.data.body = "";
  }

  const { title, body } = this.data;

  this.data = {
    title: title.trim(),
    body: body.trim(),
    createdDate: new Date(),
    author: new ObjectID(this.userid)
  };
};

Post.prototype.validate = function() {
  const { title, body } = this.data;
  if (title === "") {
    this.errors.push("You must provide a title");
  }
  if (body === "") {
    this.errors.push("You must provide post content");
  }
};

Post.findSingleById = id => {
  return new Promise(async (resolve, reject) => {
    if (typeof id !== "string" || !ObjectID.isValid(id)) {
      reject();
      return;
    }

    const posts = await postsCollection
      .aggregate([
        {
          $match: {
            _id: new ObjectID(id)
          }
        },
        {
          $lookup: {
            from: "users",
            localField: "author",
            foreignField: "_id",
            as: "authorDocument"
          }
        },
        {
          $project: {
            title: 1,
            body: 1,
            createdDate: 1,
            author: {
              $arrayElemAt: ["$authorDocument", 0]
            }
          }
        }
      ])
      .toArray();

    posts.forEach(post => {
      post.author = {
        username: post.author.username,
        avatar: new User(post.author, true).avatar
      };
    });

    if (posts.length) {
      resolve(posts[0]);
    } else {
      reject();
    }
  });
};

module.exports = Post;
