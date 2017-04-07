chrome.tabs.onActiveChanged.addListener((tabId) => {
  chrome.tabs.get(tabId, (tab) => {
    console.log("Tabbs", tab, tab.openerTabId);
  });
});
chrome.tabs.onCreated.addListener((tab) => {
  console.log("Tab created", tab, tab.openerTabId);
});
