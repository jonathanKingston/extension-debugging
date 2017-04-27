const assignManager = {
  init() {
    let requestStore = new Map();

    // Looks like we can get all keys in onResponseStarted besides requestHeaders
    browser.webRequest.onBeforeSendHeaders.addListener((options) => {
      requestStore.set(options.requestId, options);
    }, {urls: ["<all_urls>"]}, ["requestHeaders"]);

    browser.webRequest.onResponseStarted.addListener((options) => {
      // Ignore background requests
      if (options.tabId === -1) {
        return {};
      }
      let headerRequest;
      let requestCookie;
      if (requestStore.has(options.requestId)) {
        headerRequest = requestStore.get(options.requestId);
        requestStore.delete(options.requestId);
        requestCookie = headerRequest.requestHeaders.find((header) => {
          if (header.name.toLowerCase() === "cookie") {
            return true;
          }
        });
      }
      const targetURLObject = new URL(options.url);
      let originURLObject;
      if (options.originUrl) {
        originURLObject = new URL(options.originUrl);
      }
      // Appears to be undocumented the frame origin the request came from, if main frame key doesn't exist
      // To test
      let documentURLObject;
      if (options.documentUrl) {
         documentURLObject = new URL(options.documentUrl);
      }
      let responseCookie = options.responseHeaders.find((header) => {
        if (header.name.toLowerCase() === "set-cookie") {
          return true;
        }
      });
      return browser.tabs.get(options.tabId).then((tab) => {
        console.log("Got data", options, headerRequest, tab);
        const pageURLObject = new URL(tab.url);
        if (targetURLObject.hostname !== pageURLObject.hostname) {
          console.log("Store data", {
            document: documentURLObject.hostname,
            target: targetURLObject.hostname,
            origin: originURLObject.hostname,
            page: pageURLObject.hostname,
            cookieStoreId: tab.cookieStoreId,
            cached: options.fromCache,
            private: tab.incognito,
            cookie: !!responseCookie || !!requestCookie
          });
        }
      }).catch((e) => {
        throw e;
      });
    },{urls: ["<all_urls>"]}, ["responseHeaders"]);
  }
};

assignManager.init();
