//resolve html tag, which is more dominant than <body>

/*Move webpage html by 30px and make room for side panel */
var width = 30;
var html;
    if (document.documentElement) {
    html = document.documentElement;
} else if (document.getElementsByTagName('html') && document.getElementsByTagName('html')[0]) {
    html = $(document.getElementsByTagName('html')[0]);
} else {
    alert('no html tag retrieved...!');
}

//position
if (getComputedStyle(html).position === 'static') { //or //or getComputedStyle(html).position
  // html.style.position = 'relative';
  html.setAttribute('style' , 'position: relative;width: calc(100% - 30px)');
}

var currentRight = getComputedStyle(html).right;
if (currentRight === 'auto') {
  currentRight = 0;
} else {
  currentRight = parseFloat(getComputedStyle(html).right); //parseFloat removes any 'px' and returns a number type
}

// html.style.right = currentRight + parseFloat(width) + 'px';

/*Create and append side panel*/
var iframeId = 'alSidePanel';

if (document.getElementById(iframeId)) {
  alert('id:' + iframeId + 'taken please dont use this id!');
  throw 'id:' + iframeId + 'taken please dont use this id!';
}

var iframe = document.createElement('iframe'); 
iframe.style.background = "#CCC";
iframe.style.height = "100%";
iframe.style.width = "30px";
iframe.style.position = "fixed";
iframe.style.top = "0px";
iframe.style.right = "0px";
iframe.style.zIndex = "54658251513";
iframe.style.transition = 'width 0.3s ease-in-out';
iframe.frameBorder = "none"; 
iframe.id = 'alSidePanel'
iframe.src = chrome.extension.getURL("src/browser_action/browser_action.html")
// document.body.appendChild(iframe);

html.append(iframe);


/*Listent for post message event from iframe*/
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse){
    if(request.message === 'openFrame'){
      iframe.style.width = '300px';
    }else if(request.message === 'closeFrame'){
      iframe.style.width = '30px';
    }else if(request.message === 'addNewStep'){
        _addNewStep();
    }else if(request.message === 'runIntro'){
        _runIntro();
    }
    sendResponse();
  }
);