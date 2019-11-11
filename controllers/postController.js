const sendgrid = require("@sendgrid/mail");
const Post = require("../models/Post");

sendgrid.setApiKey(process.env.SENDGRIDAPIKEY)

exports.viewCreateScreen = (req, res) => {
  res.render("create-post", {
    title: "Create a new post"
  });
};

exports.create = async (req, res) => {
  const post = new Post(req.body, req.session.user._id);
  try {
    const createdPostId = await post.create();
    sendgrid.send({
      to: "mixail1024070@mail.ru",
      from: "test@test.com",
      subject: "Test",
      text: "Fallback for non-html email-agents",
      html: "<h1>Hello!</h1>"
    })
    req.flash("success", "New post successfully created");
    req.session.save(() => {
      res.redirect(`/post/${createdPostId}`);
    });
  } catch (errors) {
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
    res.render("single-post-screen", {
      post,
      title: post.title
    });
  } catch (error) {
    res.render("404", {
      title: "Page not found"
    });
  }
};

exports.viewEditScreen = async (req, res) => {
  try {
    const post = await Post.findSingleById(req.params.id, req.visitorId);
    if (post.isVisitorOwner) {
      res.render("edit-post", {
        post,
        title: "Edit post"
      });
    } else {
      req.flash("errors", "You don't have permission to perform that action");
      req.session.save(() => {
        res.redirect("/");
      });
    }
  } catch (error) {
    res.render("404", {
      title: "Page not found"
    });
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

exports.remove = async (req, res) => {
  try {
    await Post.delete(req.params.id, req.visitorId);
    req.flash("success", "Post was successfully deleted");
    req.session.save(() => {
      res.redirect(`/profile/${req.session.user.name}`);
    });
  } catch (errors) {
    // a post doesn't exist
    // current visitor is not the owner of the post
    req.flash("errors", "You don't have permission to perform that action");
    req.session.save(() => {
      res.redirect("/");
    });
  }
};

exports.search = async (req, res) => {
  try {
    const posts = await Post.search(req.body.searchTerm);
    res.json(posts);
  } catch (error) {
    res.json([]);
  }
};

// API

exports.apiCreate = async (req, res) => {
  const post = new Post(req.body, req.apiUser._id);
  try {
    await post.create();
    res.json("New post successfully created");
  } catch (errors) {
    res.json(errors);
  }
};

exports.apiDelete = async (req, res) => {
  try {
    await Post.delete(req.params.id, req.apiUser._id);
    res.json("Post successfully deleted");
  } catch (errors) {
    // a post doesn't exist
    // current visitor is not the owner of the post
    res.json(errors);
  }
};
