const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
const flash = require("connect-flash");

const app = express();

app.use(
  session({
    secret: "NodeJS is so cool",
    store: new MongoStore({
      client: require("./db")
    }),
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 сутки
      httpOnly: true
    }
  })
);

app.use(flash());

const getUserFromRequest = (req, res, next) => {
  // make flash messages available
  res.locals.errors = req.flash("errors");
  res.locals.success = req.flash("success");
  // make current user id available on the req object
  if (req.session.user) {
    req.visitorId = req.session.user._id;
  } else {
    req.visitorId = 0;
  }
  // make user session data available to view templates
  res.locals.user = req.session.user;
  next();
};

app.use(getUserFromRequest);

const router = require("./router");

app.use(
  express.urlencoded({
    extended: false
  })
);
app.use(express.json());

app.use(express.static("public"));
app.set("views", "views");
app.set("view engine", "ejs");

app.use("/", router);

module.exports = app;
