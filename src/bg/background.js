// if you checked "fancy-settings" in extensionizr.com, uncomment this lines

// var settings = new Store("settings", {
//     "sample_setting": "This is how you use Store.js to remember values"
// });


//example of using a message handler from the inject scripts
chrome.extension.onMessage.addListener(
  function(request, sender, sendResponse) {
  	chrome.pageAction.show(sender.tab.id);
    sendResponse();
  });



chrome.browserAction.onClicked.addListener(function (tab) {

    chrome.tabs.query({active: true, currentWindow: true}, function(tabs){

        chrome.tabs.executeScript(tabs[0].id, {file: "../inject/intro.js"});
        chrome.tabs.executeScript(tabs[0].id, {file: "../inject/inject.js"});
        /*chrome.tabs.insertCSS(tabs[0].id, { file: "On-board/src/inject/inject.css" });
        chrome.tabs.insertCSS(tabs[0].id, { file: "On-board/src/inject/intro.css" });*/

    });

});