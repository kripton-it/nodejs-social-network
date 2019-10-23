const Post = require("../models/Post");

exports.viewCreateScreen = (req, res) => {
  res.render("create-post");
};

exports.create = async (req, res) => {
  const post = new Post(req.body, req.session.user._id);
  try {
    await post.create();
    res.send("New post created");
  } catch (errors) {
    res.send(errors);
  }
};
