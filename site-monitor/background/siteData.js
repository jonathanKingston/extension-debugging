/**
 * SiteData stores all information for sites sub resource and top level page loads
 * This caches data from the observatory so that pages can query it later to reduce requests to the server
 */
class SiteData {
  constructor() {
    const indexes = [
      "siteKey",
      "state" // pending: 1 finished: 2
    ];
    this.storage = new Dexie("sites");
    const websites = indexes.join(", ");
    this.storage.version(1).stores({
      websites
    });
    this.storage.open();
  }

  getSiteKey(url) {
    const urlObj = new URL(url);
    if (urlObj.protocol !== "http:"
        && urlObj.protocol !== "https:") {
      return false;
    }
    return urlObj.hostname;
  }

  async fetchSiteData(siteKey) {
    if (siteKey === false) {
      return;
    }
    try {
      await this._storeSite(siteKey, 1, {});
    } catch (e) {
      console.log({siteKey, e});
    }
    this.checkObservatory(siteKey);
  }

  async checkObservatory(siteKey) {
    const response = await fetch(`https://http-observatory.security.mozilla.org/api/v1/analyze?host=${siteKey}`, {
      method: "POST"
    });
    const json = await response.json();
    if (json.state === "FINISHED") {
      this._storeSite(siteKey, 2, json);
    } else {
      // TODO handle failures
      // TODO check if it's loading still, store that we are loading
      // Keep checking to see when it's finished and store that too
    }
  }

  _storeSite(siteKey, state, data) {
    return this.storage.websites.put({siteKey, state, data});
  }

  async storeSite(url, data) {
    const siteKey = this.getSiteKey(url);
    const site = await this.getSite(siteKey);
    // TODO update request time here
    if (!site) {
      this.fetchSiteData(siteKey);
    }
    return siteKey;
  }

  async getSite(siteKey) {
    if (siteKey) {
      const response = await this.storage.websites.get(siteKey);
      return response;
    }
    return false;
  }
}
