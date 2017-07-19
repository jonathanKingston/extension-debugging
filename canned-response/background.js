const storage = {
  storageArea: browser.storage.sync,
  storageKey: "responses",

  async getResponses() {
    const responsesData = await this.storageArea.get([this.storageKey]);
    return responsesData[this.storageKey] || [];
  },

  async deleteResponse(id) {
    const responses = await this.getResponses();
    responses.splice(id, 1);
    return this.setResponses(responses);
  },

  async setResponses(responses) {
    await this.storageArea.set({
      [this.storageKey]: responses
    });
  }
};

async function makeContextMenu() {
console.log("hey");
  const responses = await storage.getResponses(); 
  responses.forEach((response, id) => {
console.log(response);
    browser.contextMenus.create({
      id: `${id}`,
      title: response.name,
      contexts: ["editable"],
    });
  });
  browser.contextMenus.create({
    type: "separator",
    contexts: ["editable"],
  });
}

browser.contextMenus.onClicked.addListener((info, tab) => {
  console.log({info, tab});
});

makeContextMenu();
