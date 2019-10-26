const User = require("../models/User");
const Post = require("../models/Post");

exports.home = (req, res) => {
  if (!req.session.user) {
    res.render("home-guest", {
      regErrors: req.flash("regErrors")
    });
  } else {
    res.render("home-dashboard");
  }
};

exports.register = async (req, res) => {
  const user = new User(req.body);
  try {
    await user.register();
    req.session.user = {
      name: user.data.username,
      avatar: user.avatar,
      _id: user.data._id
    };
    req.session.save(() => {
      res.redirect("/");
    });
  } catch (regErrors) {
    regErrors.forEach(error => {
      req.flash("regErrors", error);
    });
    req.session.save(() => {
      res.redirect("/");
    });
  }
};

exports.login = async (req, res) => {
  const user = new User(req.body);
  try {
    await user.login();
    req.session.user = {
      name: user.data.username,
      avatar: user.avatar,
      _id: user.data._id
    };
    // express-session doesn't support promises
    req.session.save(() => {
      res.redirect("/");
    });
  } catch (error) {
    req.flash("errors", error);
    req.session.save(() => {
      res.redirect("/");
    });
  }
};

exports.logout = (req, res) => {
  // express-session doesn't support promises
  req.session.destroy(() => {
    res.redirect("/");
  });
};

exports.mustBeLoggedIn = (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    req.flash("errors", "You must be logged in to perform that action");
    req.session.save(() => {
      res.redirect("/");
    });
  }
};

exports.ifUserExists = async (req, res, next) => {
  try {
    req.profileUser = await User.findByUsername(req.params.username);
    next();
  } catch (error) {
    res.render("404");
  }
};

exports.profilePostsScreen = async (req, res) => {
  try {
    const { _id, username, avatar } = req.profileUser;
    // ask post model for posts by an author id
    const posts = await Post.findByAuthorId(_id);
    res.render("profile", {
      username,
      avatar,
      posts
    });
  } catch(error) {
    res.render("404");
  }
};
