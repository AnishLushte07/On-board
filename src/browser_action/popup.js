

function putOnBoardingElement() {

    chrome.tabs.executeScript(null, { file: "src/inject/inject.js" });
    chrome.tabs.executeScript(null, { file: "src/inject/intro.js" });
    chrome.tabs.insertCSS(null, { file: "src/inject/inject.css" });
    chrome.tabs.insertCSS(null, { file: "src/inject/intro.css" });

    window.close();
}

document.addEventListener('DOMContentLoaded', function () {
    var startOnboard;
    if(!startOnboard){
        startOnboard = document.querySelector('#startOnboard');
        startOnboard.addEventListener('click', putOnBoardingElement);
    }

});