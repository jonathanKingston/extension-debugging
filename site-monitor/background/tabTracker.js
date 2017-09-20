/**
 * TabTracker checks requests and keeps objects in a Map to keep their state updated.
 *  Once the page changes it removes the PageData object and replaces with a new top level.
 */
class TabTracker {
  constructor() {
    this.siteData = new SiteData();
    this.tabMap = new Map();

    browser.tabs.onCreated.addListener((tab) => {
      if (browser.tabs.TAB_ID_NONE !== tab.id) {
        this.newTopLevelPage({tabId: tab.id, url: tab.url});
      }
    });
    browser.tabs.onRemoved.addListener((tabId) => {
      if (browser.tabs.TAB_ID_NONE !== tabId) {
        this.onRemoved(tabId);
      }
    });
    browser.webRequest.onBeforeRequest.addListener((request) => {
      if (browser.tabs.TAB_ID_NONE !== request.tabId) {
        const pageData = this.tabMap.get(request.tabId);
        if (pageData) {
          pageData.storeSite(request.url);
        }
      }
    }, {urls: ["<all_urls>"]});

    browser.runtime.onMessage.addListener((message) => {
      return this.onMessage(message);
    });

    // When we start a new page we clear old data
    browser.webNavigation.onBeforeNavigate.addListener((details) => {
      if (details.frameId == 0) {
        this.newTopLevelPage({tabId: details.tabId, url: details.url});
      }
    }, {url: [{}]});
  }

  newTopLevelPage(details) {
    this.tabMap.set(details.tabId, new PageData(details, this.siteData));
  }

  onRemoved(tabId) {
    this.tabMap.delete(tabId);
  }

  async onMessage({activeTabId}) {
    const currentTabObject = this.tabMap.get(activeTabId);
    return currentTabObject ? currentTabObject.currentSites() : false;
  }
}

new TabTracker();