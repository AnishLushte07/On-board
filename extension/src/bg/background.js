


chrome.browserAction.onClicked.addListener(function (tab) {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
        chrome.tabs.executeScript(null, { file: "src/bg/content_script.js" });
        /*chrome.tabs.executeScript(null, { file: "src/inject/inject.js" });
        chrome.tabs.executeScript(null, { file: "src/inject/intro.js" });
        chrome.tabs.insertCSS(null, { file: "src/inject/inject.css" });
        chrome.tabs.insertCSS(null, { file: "src/inject/intro.css" });*/
        chrome.tabs.executeScript(null, { file: "src/inject/main.js" });
        chrome.tabs.insertCSS(null, { file: "src/inject/main.css" });
    });
});