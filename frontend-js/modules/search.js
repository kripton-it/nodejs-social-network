import axios from "axios";
import DOMPurify from "dompurify";

export default class Search {
  // 1. Select DOM elements
  // 2. Keep track of any useful data
  constructor() {
    this.insertHTML();
    this.openIcon = document.querySelector(".header-search-icon");
    this.overlay = document.querySelector(".search-overlay");
    this.closeIcon = document.querySelector(".close-live-search");
    this.searchInput = document.querySelector(".live-search-field");
    this.resultsArea = document.querySelector(".live-search-results");
    this.loaderIcon = document.querySelector(".circle-loader");
    this.typingWaitingTimer;
    this.searchInputValue = "";
    this.openOverlay = this.openOverlay.bind(this);
    this.onKeyPress = this.onKeyPress.bind(this);
    this.addEventListeners();
  }

  // 3. Events listening
  addEventListeners() {
    // open overlay
    this.openIcon.addEventListener("click", evt => {
      evt.preventDefault();
      this.openOverlay();
    });

    // close overlay
    this.closeIcon.addEventListener("click", evt => {
      evt.preventDefault();
      this.closeOverlay();
    });

    // sending request
    this.searchInput.addEventListener("keyup", this.onKeyPress);
  }

  // 4. Methods
  onKeyPress() {
    const value = this.searchInput.value;

    if (!value) {
      clearTimeout(this.typingWaitingTimer);
      this.hideLoader();
      this.hideResultsArea();
    }

    if (value && value !== this.searchInputValue) {
      clearTimeout(this.typingWaitingTimer);
      this.showLoader();
      this.hideResultsArea();
      this.typingWaitingTimer = setTimeout(() => {
        this.sendRequest();
      }, 500);
    }
    this.searchInputValue = value;
  }

  openOverlay() {
    this.overlay.classList.add("search-overlay--visible");
    setTimeout(() => {
      this.searchInput.focus();
    }, 30);
  }

  closeOverlay() {
    this.overlay.classList.remove("search-overlay--visible");
  }

  showLoader() {
    this.loaderIcon.classList.add("circle-loader--visible");
  }

  showResultsArea() {
    this.resultsArea.classList.add("live-search-results--visible");
  }

  hideLoader() {
    this.loaderIcon.classList.remove("circle-loader--visible");
  }

  hideResultsArea() {
    this.resultsArea.classList.remove("live-search-results--visible");
  }

  sendRequest() {
    axios
      .post("/search", {
        searchTerm: this.searchInput.value
      })
      .then(response => {
        this.renderResultsHTML(response.data);
      })
      .catch(console.log);
  }

  renderResultsHTML(posts) {
    if (posts.length) {
      this.resultsArea.innerHTML = DOMPurify.sanitize(`
        <div class="list-group shadow-sm">
          <div class="list-group-item active">
            <strong>Search Results</strong> 
            (${posts.length} item${posts.length > 1 ? "s" : ""} found)
          </div>
          ${posts.map(this.getResultTemplate).join("")}
        </div>
      `);
    } else {
      this.resultsArea.innerHTML = `
        <p class="alert alert-danger text-center shadow-sm">
          Sorry, we could not find anything for this request
        </p>
      `;
    }
    this.hideLoader();
    this.showResultsArea();
  }

  getResultTemplate({ author, title, createdDate, _id }) {
    const { avatar, username } = author;
    const postDate = new Date(createdDate);
    return `
      <a href="/post/${_id}" class="list-group-item list-group-item-action">
        <img class="avatar-tiny" src="${avatar}"> <strong>${title}</strong>
        <span class="text-muted small">
          by ${username} on ${postDate.getMonth() +
      1}/${postDate.getDate()}/${postDate.getFullYear()}
        </span>
      </a>
    `;
  }

  get overlayTemplate() {
    return `
    <div class="search-overlay">
    <div class="search-overlay-top shadow-sm">
      <div class="container container--narrow">
        <label for="live-search-field" class="search-overlay-icon"><i class="fas fa-search"></i></label>
        <input type="text" id="live-search-field" class="live-search-field" placeholder="What are you interested in?">
        <span class="close-live-search"><i class="fas fa-times-circle"></i></span>
      </div>
    </div>

    <div class="search-overlay-bottom">
      <div class="container container--narrow py-3">
        <div class="circle-loader"></div>
        <div class="live-search-results"></div>
      </div>
    </div>
  </div>  
    `;
  }

  insertHTML() {
    document.body.insertAdjacentHTML("beforeend", this.overlayTemplate);
  }
}
