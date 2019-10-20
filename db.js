const mongodb = require("mongodb");

const mongoСonnectionString =
  "mongodb://qwerty:kripton123@cluster0-shard-00-00-uqn88.mongodb.net:27017,cluster0-shard-00-01-uqn88.mongodb.net:27017,cluster0-shard-00-02-uqn88.mongodb.net:27017/OurApp?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true&w=majority";

const mongoConfig = {
  useNewUrlParser: true,
  useUnifiedTopology: true
};

const mongoHandler = (error, client) => {
  if (error) {
    console.log("Error happened: ", error);
  } else {
    module.exports = client.db();
    const app = require("./app");
    const port = process.env.PORT || 3000;
    app.listen(port);
  }
};

mongodb.connect(mongoСonnectionString, mongoConfig, mongoHandler);
