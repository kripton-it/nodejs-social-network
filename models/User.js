const usersCollection = require("../db").db().collection("users");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const md5 = require("md5");

const User = function(data) {
  this.data = data;
  this.errors = [];
};

User.prototype.cleanup = function() {
  if (typeof this.data.username !== "string") {
    this.data.username = "";
  }
  if (typeof this.data.email !== "string") {
    this.data.email = "";
  }
  if (typeof this.data.password !== "string") {
    this.data.password = "";
  }

  const { username, email, password } = this.data;

  // get rid of any extra properties
  this.data = {
    username: username.trim().toLowerCase(),
    email: email.trim().toLowerCase(),
    password
  };
};

User.prototype.validate = function() {
  return new Promise(async (resolve, reject) => {
    const { username, email, password } = this.data;
  
    if (username === "") {
      this.errors.push("You must provide a username");
    }
    if (username.length > 0 && username.length < 3) {
      this.errors.push("Your username must have at least 3 characters");
    }
    if (username.length > 30) {
      this.errors.push("Your username cannot exceed 30 characters");
    }
    if (username.length > 0 && !validator.isAlphanumeric(username)) {
      this.errors.push("Your username can only contain letters and numbers");
    }
  
    if (!validator.isEmail(email)) {
      this.errors.push("You must provide a valid email");
    }
  
    if (password === "") {
      this.errors.push("You must provide a password");
    }
    if (password.length > 0 && password.length < 12) {
      this.errors.push("Your password must have at least 12 characters");
    }
    if (password.length > 50) {
      this.errors.push("Your password cannot exceed 50 characters");
    }
  
    // only if username is valid, then check if it is already taken
    if (username.length >= 3 && username.length <= 30 && validator.isAlphanumeric(username)) {
      const isUsernameExists = await usersCollection.findOne({ username });
  
      if (isUsernameExists) {
        this.errors.push("That username is already taken");
      }
    }
  
    // only if email is valid, then check if it is already being used
    if (validator.isEmail(email)) {
      const isEmailExists = await usersCollection.findOne({ email });
  
      if (isEmailExists) {
        this.errors.push("That email is already being used");
      }
    }

    resolve();
  });
}

User.prototype.register = function() {
  return new Promise(async (resolve, reject) => {
    // Step 1: Validate user data
    this.cleanup();
    await this.validate();
    // Step 2: Only if step 1 is correct,
    //         save the data into a database
    if (!this.errors.length) {
      const salt = bcrypt.genSaltSync(10);
      this.data.password = bcrypt.hashSync(this.data.password, salt);
      await usersCollection.insertOne(this.data);
      this.getAvatar();
      resolve();
    } else {
      reject(this.errors);
    }
  })
}

User.prototype.login = async function() {
  const { username, password } = this.data;

  return new Promise((resolve, reject) => {
    this.cleanup();
    try {
      const user = await usersCollection.findOne({ username });
      if (user && bcrypt.compareSync(password, user.password)) {
        this.data = user;
        this.getAvatar();
        resolve("You are logged in successfully");
      } else {
        reject("Invalid username / password");
      }
    } catch(error) {
      reject("Please try again later");
    }
  });
};

User.prototype.getAvatar = function() {
  this.avatar = `https://gravatar.com/avatar/${md5(this.data.email)}?s=128`;
}

module.exports = User;
