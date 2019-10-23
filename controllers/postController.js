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

exports.viewSingle = async (req, res) => {
  try {
    const post = await Post.findSingleById(req.params.id);
    res.render("single-post-screen", { post });
  } catch(error) {
    res.send("404 template will go here")
  }
};
