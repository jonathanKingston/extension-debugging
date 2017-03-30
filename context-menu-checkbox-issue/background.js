chrome.contextMenus.create({
  id: "bloopy",
  title: "This is another thing",
  type: "checkbox",
  checked: true,
  contexts: ["all"],
});
