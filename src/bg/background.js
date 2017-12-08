// if you checked "fancy-settings" in extensionizr.com, uncomment this lines

// var settings = new Store("settings", {
//     "sample_setting": "This is how you use Store.js to remember values"
// });


//example of using a message handler from the inject scripts
/*chrome.extension.onMessage.addListener(
  function(request, sender, sendResponse) {
  	chrome.pageAction.show(sender.tab.id);
    sendResponse();
  });*/



chrome.browserAction.onClicked.addListener(function (tab) {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
        chrome.tabs.executeScript(null, { file: "src/bg/content_script.js" });
        chrome.tabs.executeScript(null, { file: "src/inject/inject.js" });
        chrome.tabs.executeScript(null, { file: "src/inject/intro.js" });
        chrome.tabs.insertCSS(null, { file: "src/inject/inject.css" });
        chrome.tabs.insertCSS(null, { file: "src/inject/intro.css" });
    });
});