let focusCount = 0;
const menuId = "poopie";

chrome.contextMenus.create({
  id: menuId,
  title: `This is an initial menu item`,
  contexts: ["all"],
});

chrome.windows.onFocusChanged.addListener((windowId) => {
console.log("onFocusChanged", windowId);
  // lets not count focus of -1, Chrome behaves the same here
  if (windowId !== -1) {
    ++focusCount;
    chrome.tabs.query({active: true, windowId}, (tabs) => {
      console.log("tabs", tabs);
      showMenuItem(tabs[0]);
    });
  }

});

chrome.tabs.onActivated.addListener((info) => {
console.log("tab change");
  chrome.tabs.get(info.tabId, (tab) => {
console.log("tab change got tab", tab);
    showMenuItem(tab);
  });
});

chrome.webRequest.onCompleted.addListener((options) => {
console.log("web request", options);
  if (options.frameId !== 0 || options.tabId === -1) {
    return {};
  }
  chrome.tabs.get(options.tabId, (tab) => {
console.log("web request got tab", tab);
    showMenuItem(tab);
  });
},{urls: ["<all_urls>"], types: ["main_frame"]}, ["blocking"]);


function showMenuItem(tab) {
console.log("Showing menu item", focusCount, tab);
  chrome.contextMenus.remove(menuId);
  chrome.contextMenus.create({
    id: menuId,
    title: `Focus ${focusCount} Url ${tab.url}`,
    contexts: ["all"],
  });
}
