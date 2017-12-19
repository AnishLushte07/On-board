

angular.module('alOnBoarding')
    .controller('AppController', ['$log','$scope','$http', 'apiUrl',
        function ($log, $scope, $http, apiUrl) {
            //console.log('AppController')
            //console.log(angular.toJson($state.get()));
            //loading main page content scripts here ?????????????
            $log.log('App controller initialized');

            var vm = this;
            vm.editStepCopy;
            vm.steps = [];
            vm.removeStep = removeStep;
            vm.editStep = editStep;
            vm.saveStep = saveStep;
            vm.cancel = cancel;
            vm.saveIntro = saveIntro;
            vm.copyScriptTag = copyScriptTag;

            vm.introUrl;

            chrome.runtime.onMessage.addListener(
                function(request, sender, sendResponse){
                    if(request.message === 'addOpenClass'){
                        updateStepJson(request.steps);
                        toggleOpenClass();
                    }
                }
            );

            function copyScriptTag() {
                var input = document.getElementById('urlContainer');

                input.focus();
                input.setSelectionRange(0, input.value.length);

                document.execCommand('copy');
            }

            function clearIntroSteps(){
                chrome.tabs.query({ active: true, currentWindow: true}, function(tabs){
                    chrome.tabs.sendMessage(tabs[0].id, {message: 'clearIntroSteps'}, function(res){
                        vm.steps = [];
                    });
                });
            }

            function saveIntro(name){

                chrome.tabs.query({ active: true, currentWindow: true}, function(tabs){

                    chrome.tabs.sendMessage(tabs[0].id, {message: 'getHostname'}, function(res){

                        if(!name){
                            alert('Please enter name for intro');
                            return;
                        } 

                        if(vm.steps && vm.steps.length){
                            
                            var temp = {
                                steps : vm.steps,
                                name : name,
                                websiteName : res
                            };
                            
                            angular.element('#myModal').modal('hide');

                            $http.post(apiUrl+'/save/steps', temp, {})
                                .then(function(res){
                                    clearIntroSteps();
                                    vm.introUrl = res.data.introUrl;
                                    angular.element('#linkModal').modal('show');
                                }, function(err){
                                    console.log(err);
                                });


                        }else{
                            alert('Please add at least one step to intro.');
                        }

                        

                    });

                });
            }

            function cancel(stepIndex){
                console.log(vm.editStepCopy);
                vm.steps[stepIndex] = vm.editStepCopy;
                vm.steps[stepIndex].updateStep = false;
            }

            function saveStep(stepIndex){

                vm.steps[stepIndex].updateStep = false;
                chrome.tabs.query({ active: true, currentWindow: true}, function(tabs){
                    chrome.tabs.sendMessage(tabs[0].id, {message: 'updateStep', stepIndex : stepIndex, data: vm.steps[stepIndex]}, function(res){
                        $scope.$apply();
                    });
                });
            }

            function removeStep(stepIndex) {
                chrome.tabs.query({ active: true, currentWindow: true}, function(tabs){
                    chrome.tabs.sendMessage(tabs[0].id, {message: 'removeStep', stepIndex : stepIndex}, function(res){
                        vm.steps.splice(stepIndex, 1);
                        $scope.$apply();
                    });
                });
            }

            function editStep(stepIndex){
                vm.editStepCopy = angular.copy(vm.steps[stepIndex]);
                vm.steps[stepIndex].updateStep = !vm.steps[stepIndex].updateStep;
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