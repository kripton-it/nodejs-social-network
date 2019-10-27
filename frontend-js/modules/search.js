import axios from "axios";

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
    /* this.closeIcon = this.overlay.querySelector(".close-live-search");
    this.searchInput = this.overlay.querySelector(".live-search-field");
    this.resultsArea = this.overlay.querySelector(".live-search-results");
    this.loaderIcon = this.overlay.querySelector(".circle-loader"); */
    this.typingWaitingTimer;
    this.searchInputValue = "";
    this.openOverlay = this.openOverlay.bind(this);
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
    this.searchInput.addEventListener("keyup", () => {
      const value = this.searchInput.value;

      if (value && value !== this.searchInputValue) {
        clearTimeout(this.typingWaitingTimer);
        this.showLoader();
        this.typingWaitingTimer = setTimeout(() => {
          this.sendRequest();
        }, 5000);
      }

      this.searchInputValue = value;
    });
  }

  // 4. Methods
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

  hideLoader() {
    this.loaderIcon.classList.remove("circle-loader--visible");
  }

  sendRequest() {
    axios
      .post("/search", {
        searchTerm: this.searchInput.value
      })
      .then(response => {
        console.log(response.data);
      })
      .catch(console.log);
  }

  get template() {
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
        <div class="live-search-results">
          <div class="list-group shadow-sm">
            <div class="list-group-item active"><strong>Search Results</strong> (4 items found)</div>

            <a href="#" class="list-group-item list-group-item-action">
              <img class="avatar-tiny" src="https://gravatar.com/avatar/b9216295c1e3931655bae6574ac0e4c2?s=128"> <strong>Example Post #1</strong>
              <span class="text-muted small">by barksalot on 0/14/2019</span>
            </a>
            <a href="#" class="list-group-item list-group-item-action">
              <img class="avatar-tiny" src="https://gravatar.com/avatar/b9408a09298632b5151200f3449434ef?s=128"> <strong>Example Post #2</strong>
              <span class="text-muted small">by brad on 0/12/2019</span>
            </a>
            <a href="#" class="list-group-item list-group-item-action">
              <img class="avatar-tiny" src="https://gravatar.com/avatar/b9216295c1e3931655bae6574ac0e4c2?s=128"> <strong>Example Post #3</strong>
              <span class="text-muted small">by barksalot on 0/14/2019</span>
            </a>
            <a href="#" class="list-group-item list-group-item-action">
              <img class="avatar-tiny" src="https://gravatar.com/avatar/b9408a09298632b5151200f3449434ef?s=128"> <strong>Example Post #4</strong>
              <span class="text-muted small">by brad on 0/12/2019</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>  
    `;
  }

  insertHTML() {
    document.body.insertAdjacentHTML("beforeend", this.template);
  }
}
