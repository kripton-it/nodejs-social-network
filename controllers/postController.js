const Post = require("../models/Post");

exports.viewCreateScreen = (req, res) => {
  res.render("create-post");
};

exports.create = async (req, res) => {
  const post = new Post(req.body, req.session.user._id);
  try {
    const createdPostId = await post.create();
    req.flash("success", "New post successfully created");
    req.session.save(() => {
      res.redirect(`/post/${createdPostId}`);
    });
  } catch(errors) {
    errors.forEach(error => {
      req.flash("errors", error);
    });
    req.session.save(() => {
      res.redirect("/create-post");
    });
  }
};

exports.viewSingle = async (req, res) => {
  try {
    const post = await Post.findSingleById(req.params.id, req.visitorId);
    res.render("single-post-screen", { post });
  } catch (error) {
    res.render("404");
  }
};

exports.viewEditScreen = async (req, res) => {
  try {
    const post = await Post.findSingleById(req.params.id, req.visitorId);
    if (post.authorId.equals(req.visitorId)) {
      res.render("edit-post", { post });
    } else {
      req.flash("errors", "You don't have permission to perform that action");
      req.session.save(() => {
        res.redirect("/");
      });
    }
  } catch (error) {
    res.render("404");
  }
};

exports.edit = async (req, res) => {
  const post = new Post(req.body, req.visitorId, req.params.id);
  try {
    const status = await post.update();
    if (status === "success") {
      // post was updated in db
      // res.send("Post updated");
      req.flash("success", "Post was successfully updated");
      req.session.save(() => {
        res.redirect(`/post/${req.params.id}/edit`);
      });
    } else {
      // user did have permission, but there were validation errors
      post.errors.forEach(error => {
        req.flash("errors", error);
      });
      req.session.save(() => {
        res.redirect(`/post/${req.params.id}/edit`);
      });
    }
  } catch (errors) {
    // a post doesn't exist
    // current visitor is not the owner of the post
    req.flash("errors", "You don't have permission to perform that action");
    req.session.save(() => {
      res.redirect("/");
    });
  }
};
