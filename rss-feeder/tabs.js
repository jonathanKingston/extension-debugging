function feeder() {
  navigator.registerContentHandler("application/vnd.mozilla.maybe.feed",
                                 window.location.origin + "?feedy-mcfeed-feederson=%s",
                                 "My Feed Readererson");
}

feeder();
