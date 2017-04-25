const assignManager = {
  idnContainerId: null,

  init() {
    /* Set of containers that look like IDN containers,
       will use this to check for the first IDN container to throw these sites into */
    const idnlike = new Set([
      "IDN",
    ]);

    /* Hey this algo is slow and might pick up things like аррӏе.com.genuinedomain.com but yeah */
    const idnPages = new Set([
      "еріс.com",
      "IIoydsbank.com", // typo etc
      "аррӏе.com",
      "PayPaI.com"
    ]);

    /* lets lookup containers we have and remember a personal container we have */
    browser.contextualIdentities.query({}).then((identities) => {
      identities.forEach((identity) => {
        if (idnlike.has(identity.name.toLowerCase())) {
          this.idnContainerId = identity.cookieStoreId;
        }
      });
      if (!this.idnContainerId) {
        browser.contextualIdentities.create({
          name: "IDN - unsafe",
          color: "red",
          icon: "circle"
        }).then((container) => {
          this.idnContainerId = container.cookieStoreId;
        });
      }
    });

    browser.webRequest.onBeforeRequest.addListener((options) => {
      if (options.frameId !== 0 || options.tabId === -1) {
        return {};
      }
      const pageUrl = new URL(options.url);
      let match = false;
      idnPages.forEach((domain) => {
        if (match || pageUrl.hostname.includes(domain)) {
          match = true;
        }
      });
      if (!match) {
        return;
      }
      return browser.tabs.get(options.tabId).then((tab) => {
        if (tab.cookieStoreId === this.idnContainerId
            || tab.incognito) {
          return {};
        }

        this.reloadPageInContainer(options.url, this.idnContainerId, tab.index + 1);
        browser.tabs.remove(tab.id);

        return {
          cancel: true,
        };
      }).catch((e) => {
        throw e;
      });
    },{urls: ["<all_urls>"], types: ["main_frame"]}, ["blocking"]);
  },

  reloadPageInContainer(url, cookieStoreId, index) {
    browser.tabs.create({url, cookieStoreId, index});
  }
};

assignManager.init();
