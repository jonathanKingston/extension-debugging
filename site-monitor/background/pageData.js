/**
 * PageData represents a top level page
 * This will be used by the browser action to show what requests have been loaded
 *  for the current tab in question.
 */
class PageData {
  
  constructor(tab, siteData) {
    this.siteData = siteData;
    this.sites = new Set();
    if (tab.url) {
      this.storeSite(tab.url);
    }
  }

  async storeSite(url) {
    const siteKey = await this.siteData.storeSite(url);
    if (siteKey !== false) {
      this.sites.add(siteKey);
    }
  }

  async currentSites() {
    const sitePromises = [];
    this.sites.forEach((siteKey) => {
      sitePromises.push(this.siteData.getSite(siteKey));
    });
    return Promise.all(sitePromises);
  }

  }