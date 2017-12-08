

angular.module('alOnBoarding')
    .controller('AppController', ['$log','$scope', function ($log, $scope) {
        //console.log('AppController')
        //console.log(angular.toJson($state.get()));
        //loading main page content scripts here ?????????????
        $log.log('App controller initialized');

        var vm = this;
        vm.steps = [];
        vm.removeStep = removeStep;

        chrome.runtime.onMessage.addListener(
            function(request, sender, sendResponse){
                if(request.message === 'addOpenClass'){
                    updateStepJson(request.steps);
                    toggleOpenClass();
                }
            }
        );

        function removeStep(stepIndex) {
            chrome.tabs.query({ active: true, currentWindow: true}, function(tabs){
                chrome.tabs.sendMessage(tabs[0].id, {message: 'removeStep', stepIndex : stepIndex}, function(res){
                    vm.steps.splice(stepIndex, 1);
                    $scope.$apply();
                });
            });
        }

        function updateStepJson(steps) {
            vm.steps = angular.copy(steps);
            $scope.$apply();
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



    }]);