# Tab focus context menu issue

This both doesn't work in chrome and firefox however in Chrome I was able to get a different behaviour if not using the tab query callback.

The issue is the focus count doesn't change when right clicking into a different window. Closing the context menu and reopening fixes the callback delay.


Related to: https://bugzilla.mozilla.org/show_bug.cgi?id=1215376
