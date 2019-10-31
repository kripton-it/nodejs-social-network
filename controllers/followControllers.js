const Follow = require("../models/Follow");

exports.addFollow = async (req, res) => {
  const follow = new Follow(req.params.username, req.visitorId);
  try {
    await follow.create();
    req.flash("success", `Successfully followed ${req.params.username}`);
    req.session.save(() => {
      res.redirect(`/profile/${req.params.username}`);
    });
  } catch (errors) {
    errors.forEach(error => {
      req.flash("error", error);
    });
    req.session.save(() => {
      res.redirect("/");
    });
  }
};

exports.removeFollow = async (req, res) => {
  const follow = new Follow(req.params.username, req.visitorId);
  try {
    await follow.delete();
    req.flash("success", `Successfully stopped following ${req.params.username}`);
    req.session.save(() => {
      res.redirect(`/profile/${req.params.username}`);
    });
  } catch (errors) {
    errors.forEach(error => {
      req.flash("error", error);
    });
    req.session.save(() => {
      res.redirect("/");
    });
  }
};
