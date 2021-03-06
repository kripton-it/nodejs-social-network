const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
const flash = require("connect-flash");
const markdown = require("marked");
const sanitizeHTML = require("sanitize-html");
const csrf = require("csurf");
const app = express();

const apiRouter = require("./router-api");

app.use(
  express.urlencoded({
    extended: false
  })
);
app.use(express.json());
app.use("/api", apiRouter);

const sessionOptions = {
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
};

app.use(session(sessionOptions));

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

app.use(express.static("public"));
app.set("views", "views");
app.set("view engine", "ejs");

// защита от Cross-Site Request Forgery:
// даёт возможность генерить токены
// и проверять их наличие при обработке любых POST-запросов
app.use(csrf());
const setCsrfToken = (req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  next();
};
app.use(setCsrfToken);

app.use("/", router);

// обработка несовпавшего токена
const checkCsrfError = (err, req, res, next) => {
  if (err) {
    if (err.code === "EBADCSRFTOKEN") {
      req.flash("errors", "Attempt of Cross-Site Request Forgery was detected");
      req.session.save(() => {
        res.redirect("/");
      });
    } else {
      res.render("404");
    }
  }
};
app.use(checkCsrfError);

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
