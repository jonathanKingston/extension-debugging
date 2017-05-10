/**
 * Escapes any occurances of &, ", <, > or / with XML entities.
 *
 * @param {string} str
 *        The string to escape.
 * @return {string} The escaped string.
 */
function escapeXML(str) {
  const replacements = {"&": "&amp;", "\"": "&quot;", "'": "&apos;", "<": "&lt;", ">": "&gt;", "/": "&#x2F;"};
  return String(str).replace(/[&"'<>/]/g, m => replacements[m]);
}

/**
 * A tagged template function which escapes any XML metacharacters in
 * interpolated values.
 *
 * @param {Array<string>} strings
 *        An array of literal strings extracted from the templates.
 * @param {Array} values
 *        An array of interpolated values extracted from the template.
 * @returns {string}
 *        The result of the escaped values interpolated with the literal
 *        strings.
 */
function escaped(strings, ...values) {
  const result = [];

  for (const [i, string] of strings.entries()) {
    result.push(string);
    if (i < values.length)
      result.push(escapeXML(values[i]));
  }

  return result.join("");
}

function debug() {
  if (false) {
    console.log(...arguments);
  }
}

const tabManager = {
  currentContainer: [],
  currentTabs: [],
  sidebar: null,

  init() {
    this.sidebar = document.getElementById("sidebarContainer");
    this.getContainers();
    this.loadTabs();
    this.addListeners();
  },

  addListeners() {
    browser.tabs.onActivated.addListener((activeInfo) => {

      browser.tabs.get(activeInfo.tabId).then((tab) => {
        const currentSectionElement = this.sidebar.querySelector(`section[data-cookie-store-id="${tab.cookieStoreId}"`);
        this.containerOpen(currentSectionElement);
        this.loadTabs().then((activeTab) => {
          activeTab.scrollIntoView({block: "end", behavior: "smooth"});
        });
      });
    })

    // We could potentially stale check here but it might get out of date
    // tracking the tabs state in memory might be more performant though
    const refreshTabs = (tab) => {
      this.loadTabs();
    }
/* not sure if I need these yet
    browser.tabs.onActivated.addListener(refreshTabs);
    browser.tabs.onAttached.addListener(refreshTabs);
    browser.tabs.onCreated.addListener(refreshTabs);
    browser.tabs.onDetached.addListener(refreshTabs);
    browser.tabs.onMoved.addListener(refreshTabs);
    browser.tabs.onRemoved.addListener(refreshTabs);
    browser.tabs.onReplaced.addListener(refreshTabs);
    browser.tabs.onUpdated.addListener(refreshTabs);
*/
    browser.tabs.onUpdated.addListener(refreshTabs);
  },

  loadTabs() {
    return browser.tabs.query({
      windowId: browser.windows.WINDOW_ID_CURRENT
    }).then((tabs) => {
      debug('tab', tabs);
      this.currentTabs = tabs;
      return this.renderTabs();
    });
  },
  
  getContainers() {
    browser.contextualIdentities.query({
    }).then((containers) => {
      debug('got containers', containers);
      this.currentContainers = containers; 
      this.currentContainers.unshift({
        cookieStoreId: 'firefox-default',
        name: "Default"
      });
      this.render();
    });
  },

  render() {
    debug('hey', this.currentContainers, this.currentTabs);
    this.sidebar = document.getElementById("sidebarContainer");
    const fragment = document.createDocumentFragment();
  
    this.currentContainers.forEach((container) => {
      const containerElement = document.createElement("section");
      containerElement.className = "closed";
      containerElement.innerHTML = escaped`<div class="container">
        <div class="container-name">${container.name}</div>
        <span class="tab-count"></span>
        <button class="new-tab"></button>
      </div>`;
      containerElement.setAttribute("data-cookie-store-id", container.cookieStoreId);
      containerElement.addEventListener("click", this);
      const tabContainerElement = document.createElement("div");
      tabContainerElement.className = "tab-container";
      containerElement.appendChild(tabContainerElement);

      fragment.appendChild(containerElement);
    });
    this.sidebar.innerHTML = "";
    this.sidebar.appendChild(fragment);
  
    this.renderTabs();
  },

  containerOpen(sectionElement, toggle) {
    let isOpen = false;
    if (!sectionElement.classList.contains("closed")) {
      isOpen = true;
    }
    [...this.sidebar.querySelectorAll("section")].forEach((section) => {
      section.classList.add("closed");
    });

    if (!toggle || !isOpen) {
      sectionElement.classList.remove("closed");
      if (toggle) {
        // Lets open the first tab on user click
        this.tabActivate(sectionElement.querySelector('.tab-item'));
      }
    }
  },

  tabActivate(tabElement) {
    const tabId = tabElement.getAttribute("data-tab-id");
    if (tabId) {
      browser.tabs.update(Number(tabId), {
        active: true
      });
    }
  },

  tabClose(tabElement) {
    const tabId = tabElement.getAttribute("data-tab-id");
    if (tabId) {
      browser.tabs.remove(Number(tabId));
    }
  },

  handleEvent(e) {
    debug("event", e);
    switch (e.type) {
      case "click":
        const sectionElement = e.target.closest("section");
        const tabElement = e.target.closest(".tab-item");
        if (tabElement) {
          if (e.target.tagName === "BUTTON") {
            this.tabClose(tabElement);
          } else {
            this.tabActivate(tabElement);
          }
        } else if (sectionElement) {
          if (e.target.tagName === "BUTTON") {
            browser.tabs.create({
              cookieStoreId: sectionElement.getAttribute("data-cookie-store-id")
            });
          }
          this.containerOpen(sectionElement, true);
        }
        break
    }
  },

  renderTabs() {
    const containerTabs = {};
    let activeTab;
  
    this.currentTabs.forEach((tab) => {
      const cookieStoreId = tab.cookieStoreId;
      if (!(cookieStoreId in containerTabs)) {
        containerTabs[cookieStoreId] = document.createDocumentFragment();
      }
      const tabElement = document.createElement("div");
      tabElement.className = "tab-item";
      tabElement.setAttribute("data-tab-id", tab.id);
      if (tab.active) {
        tabElement.classList.add("active");
        activeTab = tabElement;
      }
      let favIconUrl = "moz-icon://goat?size=16";
      if (tab.favIconUrl) {
        favIconUrl = tab.favIconUrl;
      }
      tabElement.innerHTML = escaped`
        <img src="${favIconUrl}" />
        <div class="tab-title">${tab.title}</div>
        <button class="close-tab"></button>`;
      containerTabs[cookieStoreId].appendChild(tabElement);
    });
  
    [...document.querySelectorAll('section')].forEach((section) => {
      const tabCount = section.querySelector(".tab-count");
      const tabContainer = section.querySelector(".tab-container");
      const cookieStoreId = section.getAttribute("data-cookie-store-id");
      debug("found section", tabContainer, cookieStoreId, section, containerTabs[cookieStoreId]);
      if (cookieStoreId in containerTabs) {
        tabCount.innerText = `(${containerTabs[cookieStoreId].childNodes.length})`;
        tabContainer.innerHTML = "";
        tabContainer.appendChild(containerTabs[cookieStoreId]);
      }
    });

    return activeTab;
  }
};

tabManager.init();
