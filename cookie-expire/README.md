# Cookie expire

Set cookies to expire weekly, this makes using a Nightly browser less painful to update.

# Issues

- Cookie change method is continuously called despite no real changes, this is the same in Chrome however it makes the change method somewhat pointless for this use case
- Cookie needs a URL however none is provided in the change event, which makes manufacturing one unreliable from what I can see
- Host only and session keys are not supported in setting the cookie however come through on the change event.
