const User = require("../models/User");

exports.home = (req, res) => {
  const { user } = req.session;
  if (!user) {
    res.render("home-guest");
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
    const result = await user.login();
    req.session.user = {
      name: user.data.username
    };
    res.send(result);
  } catch (error) {
    res.send(error);
  }
};
