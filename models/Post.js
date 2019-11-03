const postsCollection = require("../db")
  .db()
  .collection("posts");
const followsCollection = require("../db")
  .db()
  .collection("follows");
const { ObjectID } = require("mongodb");
const User = require("./User");
const sanitizeHTML = require("sanitize-html");

const Post = function(data, userId, postId) {
  this.data = data;
  this.userId = userId;
  this.errors = [];
  this.postId = postId;
};

Post.prototype.update = function() {
  return new Promise(async (resolve, reject) => {
    try {
      const post = await Post.findSingleById(this.postId, this.userId);
      if (post.isVisitorOwner) {
        // update post in db
        const status = await this.actuallyUpdate();
        resolve(status);
      } else {
        reject();
      }
    } catch (error) {
      reject();
    }
  });
};

Post.prototype.actuallyUpdate = function() {
  return new Promise(async (resolve, reject) => {
    try {
      this.cleanup();
      this.validate();
      if (!this.errors.length) {
        const setOperation = {
          title: this.data.title,
          body: this.data.body
        };
        await postsCollection.findOneAndUpdate(
          { _id: new ObjectID(this.postId) },
          { $set: setOperation }
        );
        resolve("success");
      } else {
        resolve("failure");
      }
    } catch (error) {
      reject(error);
    }
  });
};

Post.prototype.create = function() {
  return new Promise(async (resolve, reject) => {
    try {
      this.cleanup();
      this.validate();
      if (!this.errors.length) {
        const response = await postsCollection.insertOne(this.data);
        resolve(response.ops[0]._id);
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

  const safeTitle = sanitizeHTML(title.trim(), {
    allowedTags: [],
    allowedAttributes: {}
  });

  const safeBody = sanitizeHTML(body.trim(), {
    allowedTags: [],
    allowedAttributes: []
  });

  this.data = {
    title: safeTitle,
    body: safeBody,
    createdDate: new Date(),
    author: new ObjectID(this.userId)
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

Post.query = (uniqueOperations, visitorId = "") => {
  return new Promise(async (resolve, reject) => {
    const lookupOperation = {
      from: "users",
      localField: "author",
      foreignField: "_id",
      as: "authorDocument"
    };
    const projectOperation = {
      title: 1,
      body: 1,
      createdDate: 1,
      authorId: "$author",
      author: {
        $arrayElemAt: ["$authorDocument", 0]
      }
    };
    const aggOperations = [
      ...uniqueOperations,
      { $lookup: lookupOperation },
      { $project: projectOperation }
    ];

    const posts = await postsCollection.aggregate(aggOperations).toArray();

    posts.forEach(post => {
      post.isVisitorOwner = post.authorId.equals(visitorId);
      // no need more
      post.authorId = undefined;
      post.author = {
        username: post.author.username,
        avatar: new User(post.author, true).avatar
      };
    });

    resolve(posts);
  });
};

Post.findSingleById = (postId, visitorId) => {
  return new Promise(async (resolve, reject) => {
    if (typeof postId !== "string" || !ObjectID.isValid(postId)) {
      reject();
      return;
    }

    try {
      const matchOperation = {
        $match: {
          _id: new ObjectID(postId)
        }
      };
      const posts = await Post.query([matchOperation], visitorId);

      if (posts.length) {
        resolve(posts[0]);
      } else {
        reject();
      }
    } catch (error) {
      reject(error);
    }
  });
};

Post.findByAuthorId = authorId => {
  const matchOperation = {
    $match: {
      author: authorId
    }
  };

  const sortOperation = {
    $sort: {
      // createdDate: 1 // по возрастанию
      createdDate: -1 // по убыванию
    }
  };

  return Post.query([matchOperation, sortOperation]);
};

Post.delete = (postId, userId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const post = await Post.findSingleById(postId, userId);
      if (post.isVisitorOwner) {
        await postsCollection.deleteOne({
          _id: new ObjectID(postId)
        });
        resolve();
      } else {
        reject();
      }
    } catch (error) {
      reject(error);
    }
  });
};

Post.search = searchTerm => {
  return new Promise(async (resolve, reject) => {
    if (typeof searchTerm !== "string") {
      reject();
      return;
    }
    try {
      const matchOperation = {
        $match: {
          // поиск по наличию подстроки
          $text: {
            $search: searchTerm
          }
        }
      };
      const sortOperation = {
        $sort: {
          // сортировка результатов поиска по релевантности
          score: {
            $meta: "textScore"
          }
        }
      };
      const posts = await Post.query([matchOperation, sortOperation]);
      resolve(posts);
    } catch (error) {
      reject(error);
    }
  });
};

Post.countPostsByAuthor = id => {
  return new Promise(async (resolve, reject) => {
    const count = await postsCollection.countDocuments({
      author: id
    });
    resolve(count);
  });
};

Post.getFeed = id => {
  // create an array of the userIds that the current user follows
  const followedUsers = await followsCollection.find({
    authorId: new ObjectID(id)
  }).toArray();
  const followersIds = followedUsers.map(user => user.followedId);
  // look for posts where the author is in the above array
  const matchOperation = {
    $match: {
      author: {
        $in: followersIds
      }
    }
  };
  const sortOperation = {
    $sort: {
      createdDate: -1
    }
  }
  return Post.query([matchOperation, sortOperation]);
};

module.exports = Post;
