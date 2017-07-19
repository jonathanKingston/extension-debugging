const sections = {
  main: {
    selector: "#main",
    async init() {
      const responses = await storage.getResponses();
      if (responses) {
        const list = document.getElementById("responses");
        list.innerText = "";
        responses.forEach((response, id) => {
          const row = createResponseRow(response, id);
          list.appendChild(row);
        });
      }
      addEnterHandler(document.querySelector("#main > button"), () => {
        showSection("createForm");
      });
    }
  },
  createForm: {
    selector: "#create-form",
    async init(response, id) {
      this.id = id;
      const form = document.querySelector("form");
      form.addEventListener("submit", this);
      const formData = Object.assign({
        name: "",
        response: ""
      }, response);
      for (field in formData) {
        form.querySelector(`[name="${field}"]`).value = formData[field];
      }
    },
    async handleEvent(e) {
      console.log("e", e);
      e.preventDefault();
      const data = new FormData(e.target);
      if (!this.id) {
        await this.addResponse(data);
      } else {
        await this.editResponse(this.id, data);
      }
      showSection("main");
    },
    makeResponse(data) {
      return {
        name: data.get("name"),
        response: data.get("response")
      };
    },
    async addResponse(data) {
      const responses = await storage.getResponses();
      responses.push(this.makeResponse(data));
      storage.setResponses(responses);
    },
    async editResponse(id, data) {
      const responses = await this.getResponses();
      responses[id] = this.makeResponse(data);
      storage.setResponses(responses);
    },
  }
};

function showSection(id, ...args) {
console.log(`Showing section ${id}`);
  const sectionObject = sections[id];
  [...document.querySelectorAll("section")].forEach((section) => {
    section.hidden = true;
  });
  document.querySelector(sectionObject.selector).hidden = false;
  sectionObject.init(...args);
}

function addEnterHandler(element, callback) {
  element.addEventListener("click", callback);
}

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

function createResponseRow(response, id) {
  const listItem = document.createElement("li");
  listItem.textContent = response.name;
  const deleteElement = document.createElement("button");
  deleteElement.textContent = "x";
  listItem.appendChild(deleteElement);
  addEnterHandler(deleteElement, async function () {
    await storage.deleteResponse(id);
    showSection("main");
  });
  const editElement = document.createElement("button");
  editElement.textContent = "edit";
  addEnterHandler(editElement, () => {
    showSection("createForm", response, id);
  });
  listItem.appendChild(editElement);

  return listItem;
}

async function init() {
  showSection("main");
}

init();
