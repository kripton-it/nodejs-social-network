import axios from "axios";

export default class RegistrationForm {
  constructor() {
    this.form = document.querySelector("#registration-form");
    this.allFields = this.form.querySelectorAll(".form-control");
    this.insertValidationElements();
    this.username = {
      element: this.form.querySelector("#username-register"),
      previousValue: "",
      timer: null,
      minLength: 3,
      maxLength: 30,
      invalid: false,
      isUnique: true
    };
    this.email = {
      element: this.form.querySelector("#email-register"),
      previousValue: "",
      timer: null,
      invalid: false,
      isUnique: true
    };
    this.password = {
      element: this.form.querySelector("#password-register"),
      previousValue: ""
    };
    this.delay = 500;
    this.addEventListeners();
  }

  addEventListeners() {
    this.username.element.addEventListener("keyup", () => {
      this.isFieldChanged(this.username, this.usernameHandler);
    });

    this.email.element.addEventListener("keyup", () => {
      this.isFieldChanged(this.email, this.emailHandler);
    });
  }

  // methods
  isFieldChanged(field, handler) {
    if (field.element.value !== field.previousValue) {
      handler.call(this);
      field.previousValue = field.element.value;
    }
  }

  // username

  usernameHandler() {
    this.username.invalid = false;
    this.usernameImmediately();
    // очистить таймер, если в нём что-то есть
    this.username.timer && clearTimeout(this.username.timer);
    this.username.timer = setTimeout(
      () => this.usernameAfterDelay(),
      this.delay
    );
  }

  // моментальная проверка

  usernameImmediately() {
    const { value, maxLength } = this.username.element;

    if (value.length > maxLength) {
      const message = `Username cannot exceed ${maxLength} characters!`;
      this.showValidationError(this.username, message);
      return;
    }

    if (value !== "" && !/^([a-zA-Z0-9]+)$/.test(value)) {
      const message = "Username can only contain letters and numbers!";
      this.showValidationError(this.username, message);
      return;
    }

    if (!this.username.invalid) {
      this.hideValidationError(this.username);
    }
  }

  showValidationError(field, message) {
    const alertElement = field.element.nextElementSibling;
    alertElement.innerHTML = message;
    alertElement.classList.add("liveValidateMessage--visible");
    field.invalid = true;
  }

  hideValidationError(field) {
    const alertElement = field.element.nextElementSibling;
    alertElement.classList.remove("liveValidateMessage--visible");
    alertElement.innerHTML = "";
  }

  // проверка с задержкой

  usernameAfterDelay() {
    const { value, minLength } = this.username.element;

    if (value.length < minLength) {
      const message = `Username must be at least ${minLength} characters!`;
      this.showValidationError(this.username, message);
      return;
    }

    // если имя валидно, то проверить, существует ли такой пользователь
    if (!this.username.invalid) {
      const url = "/doesUsernameExist";
      const data = {
        username: this.username.element.value
      };

      axios
        .post(url, data)
        .then(response => {
          if (response.data) {
            const message = `That username already exists!`;
            this.showValidationError(this.username, message);
            this.username.isUnique = false;
          } else {
            this.username.isUnique = true;
          }
        })
        .catch(error => {
          console.error(error);
        });
    }
  }

  // email

  emailHandler() {
    this.email.invalid = false;
    // очистить таймер, если в нём что-то есть
    this.email.timer && clearTimeout(this.email.timer);
    this.email.timer = setTimeout(
      () => this.emailAfterDelay(),
      this.delay
    );
  }

  emailAfterDelay() {
    const { value } = this.email.element;

    if (!/^\S+@\S+$/.test(value)) {
      const message = "You must provide a valid email address";
      this.showValidationError(this.email, message);
    }

    if (!this.email.invalid) {
      const url = "/doesEmailExist";
      const data = {
        email: value
      };

      axios
        .post(url, data)
        .then(response => {
          if (response.data) {
            const message = "That email is already being used!";
            this.showValidationError(this.email, message);
            this.email.isUnique = false;
          } else {
            this.hideValidationError(this.email);
            this.email.isUnique = true;
          }
        })
        .catch(error => {
          console.error(error);
        });
    }
  }

  insertValidationElements() {
    this.allFields.forEach(function(field) {
      field.insertAdjacentHTML(
        "afterend",
        "<div class='alert alert-danger small liveValidateMessage'></div>"
      );
    });
  }
}