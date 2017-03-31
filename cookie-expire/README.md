# Cookie expire

Set cookies to expire weekly, this makes using a Nightly browser less painful to update.

# Issues

- Cookie change method is continuously called with no indication that the extension triggered the change, this is the same in Chrome however they appear to be slower at firing this
- Debouncing the change isn't reliable in fixing the issue
- Having some form of "Set by the extension" flag on the change event would prevent this issue
- Cookie needs a URL however none is provided in the change event, which makes manufacturing one unreliable from what I can see
- Host only and session keys are not supported in setting the cookie however come through on the change event.
