(function(){

	var hostname = 'http://localhost:3000';


    var D = document;
    var W = window;
    var alIntroElement;

    var template = `<!DOCTYPE html>
						<html lang="en">
							<head>
							    <meta charset="UTF-8">
							    <title>Title</title>
							    <style>
							        .al-button{
							            border: 0;border-radius: 100%;
							            bottom: 12px;
							            display: block !important;
							            height: 54px;
							            opacity:1;
							            outline: 0;
							            position: absolute;
							            right: 12px;
							            transition: all .2s ease-out;
							            width: 54px;
							            cursor: pointer;
							        }

							        .al-popup{
							            width: 250px;
							            bottom: 70px;
							            transition: all .2s ease-out;
							            position: absolute;
							            right: 12px;
							            background-color: #ccc;
							            border-radius: 4px;
							        }
							        .intros-list{
							        	height:250px;
							            max-height: 250px;
							            overflow-y: scroll;
							        }

							        .intros-list .intro{
							            border-bottom: 1px solid #a29e9e;
							            margin: 0;
							            padding: 10px;
							            cursor: pointer;
							        }

							        .intros-list .intro{

							        }

							        .intros-list .intro h4{
							            margin: 0;
							        }
							    </style>
							</head>
							<body>
							<div style="z-index: 9999;">
							    <div id="popup" class="al-popup" style="height: 0;overflow: hidden">
							        <div style="text-align: center;background: teal;padding: 15px 0;color: #FFFFFF;">
							            <h3 style="margin: 0;">How can we help you</h3>
							        </div>
							        <div class="intros-list">
							        </div>
							    </div>
							    <button class="al-button" onclick="showPopup();">Intro</button>
							</div>
							<script>

							    var open = false;
							    var intros;

							    function getAriaLabel(ele) {
							        var ariaLabel;
							        if(ele['aria-label']){
							            ariaLabel = ele['aria-label'];
							        }
							        return ariaLabel ? ariaLabel : getAriaLabel(ele.parentElement);
							    }

							    function runIntro(e) {
							        var introName = getAriaLabel(e.target);

							        var index = intros.findIndex(function(v){
							        	return v.name == introName;
							        });

							        showPopup();

							        sendMessage(JSON.stringify({ message:'runIntro', steps : intros[index].steps}));
							    }

							    function showPopup() {
							        sendMessage(JSON.stringify({ message:'getIntros'}));
							        open = !open;
							        document.getElementById('popup').style.height = open ? '300px' : '0';
							    }

							    function bindEvent(element, eventName, eventHandler) {
						            if (element.addEventListener) {
						                element.addEventListener(eventName, eventHandler, false);
						            } else if (element.attachEvent) {
						                element.attachEvent('on' + eventName, eventHandler);
						            }
						        }
 								
 								function listIntrosInview(intros){
 									var introsListEle;

							        introsListEle = document.getElementsByClassName('intros-list')[0];

							        if(open){
							            var list = intros.map(function (v) {
							                var step = document.createElement('div');
							                step.className = 'intro';
							                step['aria-label'] = v.name;
							                step.onclick = runIntro;
							                step.innerHTML = '<h4>' + v.name + '</h4>';
							                return step;
							            });
							            list.forEach(function (v) {
							                introsListEle.appendChild(v);
							            });
							        }else{
							            while (introsListEle.hasChildNodes()) {
							                introsListEle.removeChild(introsListEle.firstChild);
							            }
							        }
 								}

						        bindEvent(window, 'message', function (e) {
						        	var data = JSON.parse(e.data);

						        	if(data.message == 'introsList'){
						        		intros = data.intros;
							            listIntrosInview(data.intros);
						        	}
						        });

						        var sendMessage = function (msg) {
						            // Make sure you are sending a string, and to stringify JSON
						            window.parent.postMessage(msg, '*');
						        };
						       
							</script>
							</body>
							</html>`;
    
    D.addEventListener('DOMContentLoaded', function () {
        console.log('Dom content loaded');
        appendIframe();
    });

    /*var createButton = function(){

        var openButton = document.createElement('button');

        openButton.setAttribute('style','border: 0;border-radius: 100%;bottom: 12px;display: block !important;height: 54px;opacity: 1;outline: 0;position: absolute;right: 12px;text-indent: -9000px;transition: all .2s ease-out;width: 54px;');

        openButton.onclick = function() {
            alIntroElement.style.width = '300px';
        };

        return openButton;
    };*/

    function appendIframe() {
        alIntroElement = document.createElement('iframe');
        alIntroElement.setAttribute('style', 'width:350px;height: 350px;background: transparent none repeat scroll 0% 0%;border: medium none;bottom: 12px;position: fixed;right: 18px;top: auto;z-index: 1050;');

        D.body.appendChild(alIntroElement);

        var temp = alIntroElement.contentWindow.document || alIntroElement.contentDocument;
        temp.write(template);
        temp.close();
    }
	
	var sendMessage = function(msg) {
        // Make sure you are sending a string, and to stringify JSON
        alIntroElement.contentWindow.postMessage(msg, '*');
    };    

    function bindEvent(element, eventName, eventHandler) {
        if (element.addEventListener){
            element.addEventListener(eventName, eventHandler, false);
        } else if (element.attachEvent) {
            element.attachEvent('on' + eventName, eventHandler);
        }
    }

    var loadIntros = function(){
    	console.log('load steps')
		var xhttp;
	  	if (window.XMLHttpRequest) {
		    // code for modern browsers
		    xhttp = new XMLHttpRequest();
	    } else {
	    	// code for IE6, IE5
	    	xhttp = new ActiveXObject("Microsoft.XMLHTTP");
		}
		xhttp.onreadystatechange = function() {
	    	if (this.readyState == 4 && this.status == 200) {
	    		var data = JSON.parse(this.responseText);
	    		console.log(data);
	    		sendMessage(JSON.stringify({ message:'introsList', intros : data[0].intros}))
	    	}
	    };
		
		xhttp.open("POST", hostname+'/api/getSteps', true);
		xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  		xhttp.send("hostname=localhost"+window.location.hostname);
	    // xhttp.send();

	    // alIntroElement.contentWindow.postMessage(JSON.stringify({ message:'introsList', intros : a}), '*');
    }

    bindEvent(window, 'message', function (e) {
    	console.log(e.data);
    	var data = JSON.parse(e.data);
        if(data.message == 'getIntros'){
        	loadIntros();	
        }else if(data.message == 'runIntro'){
        	console.log(data);
        	var intro = introJs();
		    intro.setOptions({
		        steps: data.steps
		    });
		    intro.start();
        }
    });

	function loadjscssfile(filename, filetype){
	    if (filetype=="js"){ //if filename is a external JavaScript file
	        var fileref=document.createElement('script')
	        fileref.setAttribute("type","text/javascript")
	        fileref.setAttribute("src", hostname+'/'+filename)
	        fileref.async = true;
	    }
	    else if (filetype=="css"){ //if filename is an external CSS file
	        var fileref=document.createElement("link")
	        fileref.setAttribute("rel", "stylesheet")
	        fileref.setAttribute("type", "text/css")
	        fileref.setAttribute("href", hostname+'/'+filename)
	        fileref.async = true;
	    }
	    if (typeof fileref!="undefined"){
	        document.getElementsByTagName("head")[0].appendChild(fileref);
	    }
	}
	 
	loadjscssfile("intro.css", "css");
	loadjscssfile("intro.js", "js");

})();