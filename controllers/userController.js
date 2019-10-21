const User = require("../models/User");

exports.home = (req, res) => {
  const { user } = req.session;
  if (!user) {
    res.render("home-guest", {
      loginErrors: req.flash("loginErrors") // удалит сразу после доступа
      regErrors: req.flash("regErrors")
    });
  } else {
    res.render("home-dashboard", {
      username: user.username,
    });
  }
};

exports.register = async (req, res) => {
  const user = new User(req.body);
  try {
    await user.register();
    req.session.user = {
      username: user.data.username
    };
    req.session.save(() => {
      res.redirect("/");
    });
  } catch(regErrors) {
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
      name: user.data.username
    };
    // express-session doesn't support promises
    req.session.save(() => {
      res.redirect("/");
    });
  } catch (error) {
    req.flash("loginErrors", error);
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
