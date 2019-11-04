const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
const flash = require("connect-flash");
const markdown = require("marked");
const sanitizeHTML = require("sanitize-html");

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

const forEachTemplate = (req, res, next) => {
  // make markdown function available
  res.locals.filterUserHTML = content => {
    return sanitizeHTML(markdown(content), {
      allowedTags: [
        "p",
        "br",
        "ul",
        "ol",
        "li",
        "strong",
        "bold",
        "i",
        "em",
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6"
      ],
      allowedAttributes: {}
    });
  };
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

app.use(forEachTemplate);

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

const server = require("http").createServer(app);

const io = require("socket.io")(server);

io.use((socket, next) => {
  forEachTemplate(socket.request, socket.response, next);
});

io.on("connection", socket => {
  const { user } = socket.request.session;
  if (user) {
    socket.on("chatMessageFromClient", ({ message }) => {
      const { username, avatar } = user;
      // socket - only for the source of the data
      socket.emit("welcome", {
        username,
        avatar
      });
      // io - for everyone
      // socket.broadcast - for everyone except the source of the data
      socket.broadcast.emit("chatMessageFromServer", {
        message: sanitizeHTML(message, {
          allowedTags: [],
          allowedAttributes: {}
        }),
        username,
        avatar
      });
    });
  } else {
  }
});

module.exports = server;
