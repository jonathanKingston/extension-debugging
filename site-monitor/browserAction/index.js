/**
 * Show more info about the requests on the page
 */
class BrowserAction {
  constructor() {
    this.ul = document.getElementById("menu");
    this.init();
  }

  async init() {
    const activeTabs = await browser.tabs.query({active: true});
    const activeTabId = activeTabs[0].id;
    const currentTabInfo = await browser.runtime.sendMessage({
      activeTabId
    });
    if (currentTabInfo) {
      currentTabInfo.forEach((site) => {
        // TODO escape this
        this.renderRow(`${site.siteKey} - ${site.data.grade}`);
      });
    }
  }

  renderRow(siteName) {
    const li = document.createElement("li");
    li.textContent = siteName;
    this.ul.appendChild(li);
  }
}

new BrowserAction();
