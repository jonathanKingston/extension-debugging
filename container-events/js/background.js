async function sendTabMessage(message) {
  const tabs = await browser.tabs.query({
    active: true,
    windowId: browser.windows.WINDOW_ID_CURRENT
  });
  browser.tabs.sendMessage(tabs[0].id, {
   text: message
  });
}

browser.contextualIdentities.onRemoved.addListener((change) => {
  sendTabMessage(`Deleted container: ${change.contextualIdentity.name}`);
});

browser.contextualIdentities.onCreated.addListener((change) => {
  sendTabMessage(`Created container: ${change.contextualIdentity.name}`);
});

browser.contextualIdentities.onUpdated.addListener((change) => {
  sendTabMessage(`Updated container: ${change.contextualIdentity.name}`);
});
