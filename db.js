const dotenv = require("dotenv");
const mongodb = require("mongodb");

dotenv.config();

const mongoConfig = {
  useNewUrlParser: true,
  useUnifiedTopology: true
};

const mongoHandler = (error, client) => {
  if (error) {
    console.log("Error happened: ", error);
  } else {
    module.exports = client;
    const app = require("./app");
    app.listen(process.env.PORT);
  }
};

mongodb.connect(process.env.CONNECTIONSTRING, mongoConfig, mongoHandler);
