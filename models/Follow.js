const usersCollection = require("../db")
  .db()
  .collection("users");
const followsCollection = require("../db")
  .db()
  .collection("follows");
const { ObjectID } = require("mongodb");

const Follow = function(followedUsername, authorId) {
  this.followedUsername = followedUsername;
  this.authorId = authorId;
  this.errors = [];
};

Follow.prototype.cleanup = function() {
  if (typeof this.followedUsername !== "string") {
    this.followedUsername = "";
  }
};

Follow.prototype.validate = async function(action) {
  // followedUsername must exist in database
  const followedAccount = await usersCollection.findOne({
    username: this.followedUsername
  });
  if (followedAccount) {
    this.followedId = followedAccount._id;
  } else {
    this.errors.push("You cannot follow a user that does not exist");
  }

  const followDoc = await followsCollection.findOne({
    followedId: this.followedId,
    authorId: new ObjectID(this.authorId)
  });

  if (followDoc && action === "create") {
    // follow already exists - error
    this.errors.push("You are already following this user");
  }
  if (!followDoc && action === "delete") {
    // follow already exists - error
    this.errors.push("You are not following this user, so you cannot stop following him");
  }

  // should not be able to follow yourself
  if (this.followedId.equals(this.authorId)) {
    this.errors.push("You cannot follow yourself");
  }
};

Follow.prototype.create = function() {
  return new Promise(async (resolve, reject) => {
    try {
      this.cleanup();
      await this.validate("create");
      if (!this.errors.length) {
        await followsCollection.insertOne({
          followedId: this.followedId,
          authorId: new ObjectID(this.authorId)
        });
        resolve();
      } else {
        reject(this.errors);
      }
    } catch (error) {
      this.errors.push(error);
      reject(this.errors);
    }
  });
};

Follow.prototype.delete = function() {
  return new Promise(async (resolve, reject) => {
    try {
      this.cleanup();
      await this.validate("delete");
      if (!this.errors.length) {
        await followsCollection.deleteOne({
          followedId: this.followedId,
          authorId: new ObjectID(this.authorId)
        });
        resolve();
      } else {
        reject(this.errors);
      }
    } catch (error) {
      this.errors.push(error);
      reject(this.errors);
    }
  });
};

Follow.isVisitorFollowing = async function(followedId, visitorId) {
  const followDoc = await followsCollection.findOne({
    followedId,
    authorId: new ObjectID(visitorId)
  });

  return !!followDoc;
};

module.exports = Follow;
