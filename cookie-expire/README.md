# Cookie expire

Set cookies to expire weekly, this makes using a Nightly browser less painful to update.

# Issues

- Cookie change method is continuously called with no indication that the extension triggered the change, this is the same in Chrome however they appear to be slower at firing this
- Debouncing the change isn't reliable in fixing the issue
- Having some form of "Set by the extension" flag on the change event would prevent this issue
- Cookie needs a URL however none is provided in the change event, which makes manufacturing one unreliable from what I can see
- Host only and session keys are not supported in setting the cookie however come through on the change event.


# What I would like to do easily

I would like to be able for code like this to work:

```
chrome.cookies.onChanged.addListener((changeInfo) => {
  if (changeInfo.removed) {
    return;
  }
  if (changeInfo.setByExtension) {
    return;
  }

  const cookie = changeInfo.cookie;
  cookie.secure = true;
  chrome.cookies.set(cookie);
});

```

See [Bug 1352386](https://bugzilla.mozilla.org/show_bug.cgi?id=1352386)
