const User = require("../models/User");

exports.home = (req, res) => {
  const { user } = req.session;
  if (!user) {
    res.render("home-guest", {
      errors: req.flash("errors") // удалит сразу после доступа
    });
  } else {
    res.render("home-dashboard", {
      username: user.username
    });
  }
};

exports.register = (req, res) => {
  const user = new User(req.body);
  user.register();
  if (user.errors.length) {
    res.send(user.errors);
  } else {
    res.send("No errors");
  }
};

exports.login = async (req, res) => {
  const user = new User(req.body);
  try {
    await user.login();
    req.session.user = {
      name: user.data.username
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
