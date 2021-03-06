var wikiIdentifier = 'wikipedia.org/wiki'
var igIdentifier = 'infogalactic.com/info'
var redirectedArray = {}

function replace_url (url, wikipedia_fragment, infogalactic_fragment) {
  return url.replace(new RegExp('https:\/\/(|en\.|www\.)' + wikipedia_fragment), 'https://' + infogalactic_fragment)
};

browser.browserAction.onClicked.addListener(
  function (tab) {
    browser.tabs.query(
      {active: true, currentWindow: true},
      function (tabs) {
        var activeTab = tabs[0]
        var currentURL = activeTab.url
        redirectedArray[activeTab.id] = 'disallowRedirect'

        if (currentURL.includes(wikiIdentifier)) {
          var igURL = replace_url(currentURL, wikiIdentifier, igIdentifier)
          return browser.tabs.update({'url': igURL})
        }

        if (currentURL.includes(igIdentifier)) {
          var wikiURL = currentURL.replace(igIdentifier, wikiIdentifier)
          return browser.tabs.update({'url': wikiURL})
        }
      })
  }
)

browser.webRequest.onBeforeRequest.addListener(
  function (details) {
    if (!(details.tabId in redirectedArray)) {
      redirectedArray[details.tabId] = 'allowRedirect'
    }
    if (redirectedArray[details.tabId] === 'allowRedirect') {
      return {
        redirectUrl: replace_url(details.url, wikiIdentifier, igIdentifier)
      }
    }
  },
  {urls: ['*://*.wikipedia.org/*'], types: ['main_frame', 'sub_frame', 'stylesheet', 'script', 'image', 'object', 'xmlhttprequest', 'other']},
  ['blocking']
)

browser.tabs.onUpdated.addListener(
  function (tabid, changeInfo, tab) {
    if (changeInfo.status === 'complete') {
      if (!tab.url.includes(wikiIdentifier) && !tab.url.includes(igIdentifier)) {
        redirectedArray[tabid] = 'allowRedirect'
      }
    }
  }
)
