const containersSearch = {
  createButton(container) {
    const button = document.createElement("button");
    button.classList.add(`container-color-${container.color}`);
    button.style.mask = `url(${container.iconUrl})`;
    button.style.background = container.colorCode;
    button.title = `Search with ${container.name}`;
    button.dataset.cookieStoreId = container.cookieStoreId;
    button.addEventListener("click", this);
    button.addEventListener("submit", this);
    return button;
  },

  handleEvent(event) {
    const button = event.target;
    const cookieStoreId = button.dataset.cookieStoreId;
    const url = `https://duckduckgo.com/?q=${this.urlElement.value}&t=hw&ia=web`;
    browser.tabs.create({
      url,
      cookieStoreId
    });
  },

  init() {
    this.urlElement = document.getElementById("search-field");
    const rebuildEvent = () => {
      this.rebuildMenu();
    };
    browser.contextualIdentities.onRemoved.addListener(rebuildEvent);
    browser.contextualIdentities.onUpdated.addListener(rebuildEvent);
    browser.contextualIdentities.onCreated.addListener(rebuildEvent);
    this.rebuildMenu();
  },

  async rebuildMenu() {
    const containers = await browser.contextualIdentities.query({});
    const menu = document.getElementById("containers-menu");
    menu.innerHtml = "";
    containers.forEach((container) => {
      const button = this.createButton(container);
      menu.appendChild(button);
    });
  }
};

containersSearch.init();