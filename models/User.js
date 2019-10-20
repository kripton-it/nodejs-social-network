const validator = require("validator");

const User = function(data) {
  this.data = data;
  this.errors = [];
};

User.prototype.validate = function() {
  if (this.data.username === "") {
    this.errors.push("You must provide a username");
  }
  if (this.data.username.length > 0 && this.data.username.length < 3) {
    this.errors.push("Your username must have at least 3 characters");
  }
  if (this.data.username.length > 30) {
    this.errors.push("Your username cannot exceed 30 characters");
  }
  if (this.data.username.length > 0 && !validator.isAlphanumeric(this.data.email)) {
    this.errors.push("Your username can only contain letters and numbers");
  }

  if (!validator.isEmail(this.data.email)) {
    this.errors.push("You must provide a valid email");
  }

  if (this.data.password === "") {
    this.errors.push("You must provide a password");
  }
  if (this.data.password.length > 0 && this.data.password.length < 12) {
    this.errors.push("Your password must have at least 12 characters");
  }
  if (this.data.password.length > 100) {
    this.errors.push("Your password cannot exceed 100 characters");
  }
};

User.prototype.register = function() {
  // Step 1: Validate user data
  this.validate();
  // Step 2: Only if step 1 is correct,
  //         save the data into a database
};

module.exports = User;
