const debounce = 1000;
const store = new Map();

chrome.cookies.onChanged.addListener(function(changeInfo) {
  console.log(`Cookie changed:
               * Cookie: ${JSON.stringify(changeInfo.cookie)}
               * Cause: ${changeInfo.cause}
               * Removed: ${changeInfo.removed}`);
  if (changeInfo.removed) {
    return;
  }
  let urlish = changeInfo.cookie.domain.replace(/^\./, '');
  let prefix = "http://";
  if (changeInfo.cookie.secure) {
    prefix = "https://";
  }
  // This is painful guessing a URL, why is it needed?
  // If it is wrong it doesn't work
  // If it does then it appears to make no difference
  urlish = `${prefix}${urlish}${changeInfo.cookie.path}`;
  const key = `@urlish@${urlish}@name@${changeInfo.cookie.name}@value@${changeInfo.cookie.value}`;
  if (store.has(key)) {
    console.log(`Clearing set timeout ${key}`);
    // This seems to fire far less in Chrome however it also seems slower in general
    clearTimeout(store.get(key));
  }
  store.set(key, setTimeout(() => {
    console.log(`Calling timeout for ${key}`);
    store.delete(key);
    chrome.cookies.remove({
      url: urlish,
      name: changeInfo.cookie.name//,
      //storeId: changeInfo.cookie.storeId
    });
    let date = new Date();
    console.log(`setting cookie for ${urlish}`, changeInfo.cookie);
    // This is still getting fired in a loop
    chrome.cookies.set({
      url: urlish,
      name: changeInfo.cookie.name,
      value: changeInfo.cookie.value,
      domain: changeInfo.cookie.domain,
      path: changeInfo.cookie.path,
      secure: changeInfo.cookie.secure,
      httpOnly: changeInfo.cookie.httpOnly,
      expirationDate: date.setDate(date.getDate() + 7) / 1000,
      storeId: changeInfo.cookie.storeId
    });
  }, debounce));
});
