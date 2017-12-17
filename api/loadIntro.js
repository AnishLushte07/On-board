(function(window){

	var hostname = 'http://localhost:3000';
	
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
	
	document.addEventListener('DOMContentLoaded', function(){
		if(!window.introFilesLoaded){
			loadjscssfile("intro.css", "css");
			loadjscssfile("intro.js", "js");
			loadjscssfile("customElement.js", "js");
			window.introFilesLoaded = true;
		}
	});

	window.introsList = Array.isArray(window.introsList) ? window.introsList : [];

	window.introsList.push($steps);

})(window);