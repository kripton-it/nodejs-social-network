const postsCollection = require("../db")
  .db()
  .collection("posts");
const { ObjectID } = require("mongodb");

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
    author: ObjectID(this.userid)
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

Post.findSingleById = (id) => {
  return new Promise(async (resolve, reject) => {
    if (typeof(id) !== "string" || !ObjectID.isValid(id)) {
      reject();
      return;
    }

    const post = await postsCollection.findOne({
      _id: id
    });
    if (post) {
      resolve(post);
    } else {
      reject();
    }
  });
}

module.exports = Post;
