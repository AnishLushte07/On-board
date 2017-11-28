/*
function putOnBoardingElement() {
    chrome.tabs.executeScript(null, { file: "src/inject/inject.js" });
    chrome.tabs.executeScript(null, { file: "src/inject/intro.js" });
    chrome.tabs.insertCSS(null, { file: "src/inject/inject.css" });
    chrome.tabs.insertCSS(null, { file: "src/inject/intro.css" });
    window.close();
}

// load content script on click;
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('startOnboard').addEventListener('click', putOnBoardingElement);
});*/



// add sidepanel on right side of page

var iframeOpen = false;

function toggleIframe() {
    var msg = iframeOpen ? 'closeFrame' : 'openFrame';
    chrome.tabs.query({ active: true, currentWindow: true}, function(tabs){
        chrome.tabs.sendMessage(tabs[0].id, {message: msg}, function(res){
            iframeOpen = !iframeOpen;
        });
    });
}

document.addEventListener('DOMContentLoaded', function(){
    document.getElementById('togglePanel').addEventListener('click', function(){
        toggleIframe();
    });
});

//intro steps logic.


// listen for add new step click event

document.getElementById('alNewStep').addEventListener('click', function () {
    chrome.tabs.query({ active: true, currentWindow: true}, function(tabs){
        chrome.tabs.sendMessage(tabs[0].id, {message: 'addNewStep'}, function(res){
            toggleIframe();
        });
    });
});


document.getElementById('alRunIntro').addEventListener('click', function () {
    chrome.tabs.query({ active: true, currentWindow: true}, function(tabs){
        chrome.tabs.sendMessage(tabs[0].id, {message: 'runIntro'}, function(res){
            toggleIframe();
        });
    });
});
