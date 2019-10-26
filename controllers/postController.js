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
    const post = await Post.findSingleById(req.params.id, req.visitorId);
    res.render("single-post-screen", { post });
  } catch(error) {
    res.render("404")
  }
};

exports.viewEditScreen = async (req, res) => {
  try {
    const post = await Post.findSingleById(req.params.id, req.visitorId);
    res.render("edit-post", { post });
  } catch(error) {
    res.render("404")
  }
};
