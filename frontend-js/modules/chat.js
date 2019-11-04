import DOMPurify from "dompurify";

export default class Chat {
  constructor() {
    this.openedYet = false;
    this.chatWrapper = document.querySelector("#chat-wrapper");
    this.insertHTML();
    this.openIcon = document.querySelector(".header-chat-icon");
    this.closeIcon = this.chatWrapper.querySelector(".chat-title-bar-close");
    this.chatField = this.chatWrapper.querySelector("#chatField");
    this.chatForm = this.chatWrapper.querySelector("#chatForm");
    this.chatLog = this.chatWrapper.querySelector("#chat");
    this.socket = null;
    this.addEventListeners();
  }

  // Events
  addEventListeners() {
    this.openIcon.addEventListener("click", evt => {
      evt.preventDefault();
      this.showChat();
    });

    this.closeIcon.addEventListener("click", evt => {
      evt.preventDefault();
      this.hideChat();
    });

    this.chatForm.addEventListener("submit", evt => {
      evt.preventDefault();
      this.sendMessageToServer();
    });
  }

  // Methods
  sendMessageToServer() {
    const message = this.chatField.value;
    this.socket.emit("chatMessageFromClient", {
      message
    });
    this.displaySelfMessage(message);
    this.chatForm.reset();
    this.chatField.focus();
  }

  openConnection() {
    this.socket = io();
    this.socket.on("welcome", data => {
      this.username = data.username;
      this.avatar = data.avatar;
    });
    this.socket.on("chatMessageFromServer", data => {
      this.displayMessageFromServer(data);
    });
  }

  displaySelfMessage(message) {
    this.chatLog.insertAdjacentHTML(
      "beforeend",
      this.selfMessageTemplate(message)
    );
    this.chatLog.scrollTop = this.chatLog.scrollHeight;
  }

  displayMessageFromServer(data) {
    this.chatLog.insertAdjacentHTML("beforeend", this.messageTemplate(data));
    this.chatLog.scrollTop = this.chatLog.scrollHeight;
  }

  messageTemplate({ message, avatar, username }) {
    return DOMPurify.sanitize(`
      <div class="chat-other">
        <a href="/profile/${username}">
          <img class="avatar-tiny" src="${avatar}">
        </a>
        <div class="chat-message">
          <div class="chat-message-inner">
            <a href="/profile/${username}">
              <strong>${username}:</strong>
            </a>
            ${message}
          </div>
        </div>
      </div>
    `);
  }

  selfMessageTemplate(message) {
    return DOMPurify.sanitize(`
      <div class="chat-self">
        <div class="chat-message">
          <div class="chat-message-inner">
            ${message}
          </div>
        </div>
        <img class="chat-avatar avatar-tiny" src="${this.avatar}">
      </div>
    `);
  }

  showChat() {
    if (!this.openedYet) {
      // open connection only if this is a first opening
      this.openConnection();
    }
    this.openedYet = true;
    this.chatWrapper.classList.add("chat--visible");
    this.chatField.focus();
    // setTimeout(() => {
    //   this.chatField.focus();
    // }, 30);
  }

  hideChat() {
    this.chatWrapper.classList.remove("chat--visible");
  }

  get chatTemplate() {
    return `
      <div class="chat-title-bar">Chat 
        <span class="chat-title-bar-close">
          <i class="fas fa-times-circle"></i>
        </span>
      </div>
      <div id="chat" class="chat-log"></div>
      <form id="chatForm" class="chat-form border-top">
        <input
          type="text"
          class="chat-field"
          id="chatField"
          placeholder="Type a message…"
          autocomplete="off"
        >
      </form>
    `;
  }

  insertHTML() {
    this.chatWrapper.innerHTML = this.chatTemplate;
  }
}
