const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Post = require("../models/Post");
const Follow = require("../models/Follow");

exports.home = async (req, res) => {
  if (req.session.user) {
    // fetch feed of posts for current user
    const posts = await Post.getFeed(req.session.user._id);
    res.render("home-dashboard", {
      posts,
      title: "Dashboard"
    });
  } else {
    res.render("home-guest", {
      regErrors: req.flash("regErrors"),
      title: "Welcome"
    });
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
    res.render("404", {
      title: "Page not found"
    });
  }
};

exports.profilePostsScreen = async (req, res) => {
  try {
    const { _id, username, avatar } = req.profileUser;
    // ask post model for posts by an author id
    const posts = await Post.findByAuthorId(_id);
    res.render("profile-posts", {
      title: `Profile for ${username}`,
      username,
      avatar,
      posts,
      isFollowing: req.isFollowing,
      isVisitorsProfile: req.isVisitorsProfile,
      currentPage: "posts",
      count: req.count
    });
  } catch (error) {
    res.render("404", {
      title: "Page not found"
    });
  }
};

exports.profileFollowersScreen = async (req, res) => {
  try {
    const { _id, username, avatar } = req.profileUser;
    // ask follow model for followers of user with _id
    const followers = await Follow.getFollowersById(_id);
    res.render("profile-followers", {
      title: `Followers of ${username}`,
      username,
      avatar,
      followers,
      isFollowing: req.isFollowing,
      isVisitorsProfile: req.isVisitorsProfile,
      currentPage: "followers",
      count: req.count
    });
  } catch {
    res.render("404", {
      title: "Page not found"
    });
  }
};

exports.profileFollowingScreen = async (req, res) => {
  try {
    const { _id, username, avatar } = req.profileUser;
    // ask follow model for users which that user is following
    const following = await Follow.getFollowingById(_id);
    res.render("profile-following", {
      title: `Following by ${username}`,
      username,
      avatar,
      following,
      isFollowing: req.isFollowing,
      isVisitorsProfile: req.isVisitorsProfile,
      currentPage: "following",
      count: req.count
    });
  } catch {
    res.render("404", {
      title: "Page not found"
    });
  }
};

exports.sharedProfileData = async (req, res, next) => {
  let isVisitorsProfile = false;
  let isFollowing = false;
  if (req.session.user) {
    isVisitorsProfile = req.profileUser._id.equals(req.session.user._id);
    try {
      isFollowing = await Follow.isVisitorFollowing(
        req.profileUser._id,
        req.visitorId
      );
    } catch {}
  }

  req.isVisitorsProfile = isVisitorsProfile;
  req.isFollowing = isFollowing;

  // retrieve posts, followers and following counts
  let postsCount = 0;
  let followersCount = 0;
  let followingCount = 0;
  try {
    [postsCount, followersCount, followingCount] = await Promise.all([
      Post.countPostsByAuthor(req.profileUser._id),
      Follow.countFollowersByAuthor(req.profileUser._id),
      Follow.countFollowingByAuthor(req.profileUser._id)
    ]);
  } catch {}
  req.count = {
    posts: postsCount,
    followers: followersCount,
    following: followingCount
  };
  next();
};

exports.doesUsernameExist = async (req, res) => {
  try {
    await User.findByUsername(req.body.username);
    // если существует
    res.json(true);
  } catch {
    // если не существует
    res.json(false);
  }
};

exports.doesEmailExist = async (req, res) => {
  const doesEmailExist = await User.doesEmailExist(req.body.email);
  // если существует
  res.json(doesEmailExist);
};

// API

exports.apiLogin = async (req, res) => {
  const user = new User(req.body);
  try {
    await user.login();
    const data = {
      _id: user.data._id
    }
    const options = {
      // по умолчанию - бесконечность
      expiresIn: '30d' // 30 дней
    }
    res.json(jwt.sign(data, process.env.JWTSECRET, options));
  } catch (error) {
    res.json("False");
  }
};
