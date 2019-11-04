const dotenv = require("dotenv");
dotenv.config();

const mongodb = require("mongodb");

const mongoConfig = {
  useNewUrlParser: true,
  useUnifiedTopology: true
};

const mongoHandler = (error, client) => {
  if (error) {
    console.log("Error happened: ", error);
  } else {
    module.exports = client;
    const server = require("./server");
    server.listen(process.env.PORT);
    console.log(process.env.PORT);
  }
};

mongodb.connect(process.env.CONNECTIONSTRING, mongoConfig, mongoHandler);
