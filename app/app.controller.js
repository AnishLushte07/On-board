

angular.module('alOnBoarding')
    .controller('AppController', function ($log) {
        //console.log('AppController')
        //console.log(angular.toJson($state.get()));
        //loading main page content scripts here ?????????????
        $log.log('App controller initialized');

        var vm = this;
        vm.steps = [];

        chrome.runtime.onMessage.addListener(
            function(request, sender, sendResponse){
                console.log('popupjs runttime listener ', request);
                if(request.message === 'addOpenClass'){
                    toggleOpenClass();
                    updateStepJson(request.steps);
                }
            }
        );



        function updateStepJson(steps) {
            vm.steps = angular.copy(steps);
            /*var latestStep = steps[steps.length - 1];
            var stepHtml =  '<p>'+ latestStep.intro +'</p><p>'+ latestStep.position+'</p>';
            var child = document.createElement('div');
            child.className = 'step-view';
            child.innerHTML = stepHtml;

            // document.getElementsByClassName('content')[0].innerHTML = '<pre style="white-space: normal;">' + JSON.stringify(steps) + '</pre>';
            document.getElementsByClassName('content')[0].appendChild(child);*/
        }

        // add sidepanel on right side of page

        var iframeOpen = false;


        function toggleOpenClass() {
            iframeOpen = !iframeOpen;
            document.getElementsByClassName('main-popup')[0].classList.toggle("open");
        }

        function toggleIframe() {
            var msg = iframeOpen ? 'closeFrame' : 'openFrame';
            chrome.tabs.query({ active: true, currentWindow: true}, function(tabs){
                chrome.tabs.sendMessage(tabs[0].id, {message: msg}, function(res){
                    toggleOpenClass();
                });
            });
        }

        angular.element(document).ready(function () {
            document.getElementById('openPanel').addEventListener('click', function(){
                toggleIframe();
            });

            document.getElementById('closePanel').addEventListener('click', function(){
                toggleIframe();
            });
        });


        //intro steps logic.


        // listen for add new step click event
        console.log(document.getElementById('alNewStep'));
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



    });