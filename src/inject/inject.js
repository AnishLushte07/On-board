


var pastEle = null;
var introSteps = [];
var liveStep = {};

//Remove tooltip on remove button click
function removeTooltip(){
    liveStep.selectedElement.classList.remove('al-outline-css');
    _removeTooltip();
}


function removeStep(stepIndex) {
    introSteps.splice(stepIndex, 1);
}

//set a
function _setPostion(e){
    if(e.target.nodeName === 'SPAN'){
        if(liveStep.arrowColoredElement){
            liveStep.arrowColoredElement.classList.remove('al-arrow-selected');
        }
        _placeTooltip.call(self, liveStep.selectedElement, liveStep.tooltipLayer, liveStep.arrowLayer, e.target.id);
    }
}

function _setArrowColor(position){
    var a = document.querySelector('.al-box #'+position);
    a.classList.add('al-arrow-selected');
    liveStep.arrowColoredElement = a;
}

function _runIntro(){
    var intro = introJs();
    intro.setOptions({
        steps: introSteps
    });
    intro.start();
}


//save current intro step to customIntroStep
function addIntroStep(step) {
    introSteps.push(step);
    if(typeof(Storage) !== "undefined") {
        sessionStorage.introSteps = JSON.stringify(introSteps);
    } else {
        alert('Please enable session storage.');
    }
}

//get classlist and id of element
function _getClassesAndId(ele, attribute) {
    var value = '';
    value += attribute ? (ele.nodeName +''+ attribute) : ele.nodeName;

    if (ele.hasAttribute('id')) {
        value = value + '#' + ele.id;
    }

    if (ele.hasAttribute('class') && ele.classList.value.length) {
        value = value +'.'+Array.from(ele.classList.values()).join('.');
    }

    return value;
}

// get unique selector of element
function _getSelector(element) {
    var selector = [];

    element.classList.remove('al-outline-css');

    var attributeSelector;
    if(element.nodeName == 'A' && element.attributes.hasOwnProperty('href')){
        attributeSelector = '[href="'+ element.getAttribute('href') +'"]';
    }

    selector.push(_getClassesAndId(element, attributeSelector));

    while (element.parentElement !== null) {
        selector.push(_getClassesAndId(element.parentElement));
        element = element.parentElement;
    }

    return selector.reverse();
}


// remove tooltip from DOM.
function _removeTooltip(){
    var child = document.querySelectorAll('.introjs-tooltipReferenceLayer');

    child.forEach(function (v) {
        v.parentNode.removeChild(v);
    });

    liveStep = {};
}

//Save step title, message and position.
function _saveStep() {
    var title = document.querySelector('#intro-title').value;
    var msg = document.querySelector('#intro-msg').value;

    addIntroStep({
        element : liveStep.selector,
        intro: title,
        position: liveStep.position
    });

    _removeTooltip();
    openSidePanel();
}



/*
* Add tooltip on selectd element
* Remove click event listener from element
* Store element reference in { introOnElement }
* call _showTooltip
*/
function addIntroBox(e) {
    _removeMousemoveListener.call(self);

    e.preventDefault();
    e.stopPropagation();

    var ele = e.target;
    removeClickEventListener(ele);

    if (ele.id == undefined || ele.id == '') {
        liveStep.selector = _getSelector(e.target).join(' ');
    } else {
        liveStep.selector = '#' + ele.id;
    }

    liveStep.selectedElement = ele;

    _showTooltip(ele);
}


function _addNewStep() {
    console.log('add new step');
    _registerMousemoveListener.call(self);
}

//unset click listener on current element with outline-css class
function removeClickEventListener(ele) {
    ele.removeEventListener('click', addIntroBox);
}

//set click listener on current element with outline-css class
function addClickEventListener(ele) {
    ele.addEventListener('click', addIntroBox);
}

/*
* Add ouline-css class to selected element
* Store reference to element in { pastEle }
*/
function listentMousemove(e) {
    var cEle = e.target;

    if (pastEle) {
        pastEle.classList.remove('al-outline-css');
        removeClickEventListener(pastEle);
    }

    cEle.classList.add('al-outline-css');
    addClickEventListener(cEle);
    pastEle = cEle;
}

//unset mousemove listener on DOM.
function _removeMousemoveListener() {
    document.removeEventListener('mousemove', listentMousemove, true);
}

//set mousemove listener on DOM.
function _registerMousemoveListener() {
    document.addEventListener('mousemove', listentMousemove, true);
}


//Reference from intro js functions

function _setHelperLayerPosition(helperLayer, element) {
    if (helperLayer) {

        var elementPosition = _cGetOffset(element),
            widthHeightPadding = 10;

        //set new position to helper layer
        helperLayer.setAttribute('style', 'width: ' + (elementPosition.width + widthHeightPadding) + 'px; ' +
            'height:' + (elementPosition.height + widthHeightPadding) + 'px; ' +
            'top:' + (elementPosition.top - widthHeightPadding / 2) + 'px;' +
            'left: ' + (elementPosition.left - widthHeightPadding / 2) + 'px;');
    }
}

function _checkRight(targetOffset, tooltipLayerStyleLeft, tooltipOffset, windowSize, tooltipLayer) {
    if (targetOffset.left + tooltipLayerStyleLeft + tooltipOffset.width > windowSize.width) {
        // off the right side of the window
        tooltipLayer.style.left = (windowSize.width - tooltipOffset.width - targetOffset.left) + 'px';
        return false;
    }
    tooltipLayer.style.left = tooltipLayerStyleLeft + 'px';
    return true;
}

function _checkLeft(targetOffset, tooltipLayerStyleRight, tooltipOffset, tooltipLayer) {
    if (targetOffset.left + targetOffset.width - tooltipLayerStyleRight - tooltipOffset.width < 0) {
        // off the left side of the window
        tooltipLayer.style.left = (-targetOffset.left) + 'px';
        return false;
    }
    tooltipLayer.style.right = tooltipLayerStyleRight + 'px';
    return true;
}

function _determineAutoAlignment(offsetLeft, tooltipWidth, windowSize, desiredAlignment) {
    var halfTooltipWidth = tooltipWidth / 2,
        winWidth = Math.min(windowSize.width, window.screen.width),
        possibleAlignments = ['-left-aligned', '-middle-aligned', '-right-aligned'],
        calculatedAlignment = '';

    // valid left must be at least a tooltipWidth
    // away from right side
    if (winWidth - offsetLeft < tooltipWidth) {
        _removeEntry(possibleAlignments, '-left-aligned');
    }

    // valid middle must be at least half
    // width away from both sides
    if (offsetLeft < halfTooltipWidth ||
        winWidth - offsetLeft < halfTooltipWidth) {
        _removeEntry(possibleAlignments, '-middle-aligned');
    }

    // valid right must be at least a tooltipWidth
    // width away from left side
    if (offsetLeft < tooltipWidth) {
        _removeEntry(possibleAlignments, '-right-aligned');
    }

    if (possibleAlignments.length) {
        if (possibleAlignments.indexOf(desiredAlignment) !== -1) {
            // the desired alignment is valid
            calculatedAlignment = desiredAlignment;
        } else {
            // pick the first valid position, in order
            calculatedAlignment = possibleAlignments[0];
        }
    } else {
        // if screen width is too small
        // for ANY alignment, middle is
        // probably the best for visibility
        calculatedAlignment = '-middle-aligned';
    }

    return calculatedAlignment;
}

function _determineAutoPosition(element, tooltipLayer, desiredTooltipPosition) {
    var possiblePositions = ['bottom', 'right', 'left', 'top'];
    var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    var scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

    var windowSize = _getWinSize();
    var tooltipHeight = _cGetOffset(tooltipLayer).height + 10;
    var tooltipWidth = _cGetOffset(tooltipLayer).width + 20;
    var targetOffset = _cGetOffset(element);

    // adjust for scroll position
    targetOffset.top -= scrollTop;
    targetOffset.left -= scrollLeft;

    // If we check all the possible areas, and there are no valid places for the tooltip, the element
    // must take up most of the screen real estate. Show the tooltip floating in the middle of the screen.
    var calculatedPosition = "floating";

    /*
     * auto determine position
     */

    // Check for space below
    if ((targetOffset.height + targetOffset.top + tooltipHeight) > windowSize.height) {
        _removeEntry(possiblePositions, "bottom");
    }

    // Check for space above
    if (targetOffset.top - tooltipHeight < 0) {
        _removeEntry(possiblePositions, "top");
    }

    // Check for space to the right
    if (targetOffset.width + targetOffset.left + tooltipWidth > windowSize.width) {
        _removeEntry(possiblePositions, "right");
    }

    // Check for space to the left
    if (targetOffset.left - tooltipWidth < 0) {
        _removeEntry(possiblePositions, "left");
    }

    // @var {String}  ex: 'right-aligned'
    var desiredAlignment = (function (pos) {
        var hyphenIndex = pos.indexOf('-');
        if (hyphenIndex !== -1) {
            // has alignment
            return pos.substr(hyphenIndex);
        }
        return '';
    })(desiredTooltipPosition || '');

    // strip alignment from position
    if (desiredTooltipPosition) {
        // ex: "bottom-right-aligned"
        // should return 'bottom'
        desiredTooltipPosition = desiredTooltipPosition.split('-')[0];
    }

    if (possiblePositions.length) {
        if (desiredTooltipPosition !== "auto" &&
            possiblePositions.indexOf(desiredTooltipPosition) > -1) {
            // If the requested position is in the list, choose that
            calculatedPosition = desiredTooltipPosition;
        } else {
            // Pick the first valid position, in order
            calculatedPosition = possiblePositions[0];
        }
    }

    liveStep.position = calculatedPosition;
    // only top and bottom positions have optional alignments
    if (['top', 'bottom'].indexOf(calculatedPosition) !== -1) {
        calculatedPosition += _determineAutoAlignment(targetOffset.left, tooltipWidth, windowSize, desiredAlignment);
    }

    return calculatedPosition;
}

function _placeTooltip(element, tooltipLayer, arrowLayer, desiredPosition) {

    var tooltipCssClass = '',
        currentStepObj,
        tooltipOffset,
        targetOffset,
        windowSize,
        currentTooltipPosition;

    //hintMode = hintMode || false;

    //reset the old style
    tooltipLayer.style.top = null;
    tooltipLayer.style.right = null;
    tooltipLayer.style.bottom = null;
    tooltipLayer.style.left = null;
    tooltipLayer.style.marginLeft = null;
    tooltipLayer.style.marginTop = null;

    arrowLayer.style.display = 'inherit';

    currentTooltipPosition = desiredPosition;

    currentTooltipPosition = _determineAutoPosition.call(this, element, tooltipLayer, currentTooltipPosition);


    var tooltipLayerStyleLeft;

    targetOffset = _cGetOffset(element);
    tooltipOffset = _cGetOffset(tooltipLayer);
    windowSize = _getWinSize();

    //set initial arrow color
    _setArrowColor(liveStep.position);

    switch (currentTooltipPosition) {
        case 'top-right-aligned':
            arrowLayer.className = 'introjs-arrow bottom-right';

            var tooltipLayerStyleRight = 0;
            _checkLeft(targetOffset, tooltipLayerStyleRight, tooltipOffset, tooltipLayer);
            tooltipLayer.style.bottom = (targetOffset.height + 20) + 'px';
            break;

        case 'top-middle-aligned':
            arrowLayer.className = 'introjs-arrow bottom-middle';

            var tooltipLayerStyleLeftRight = targetOffset.width / 2 - tooltipOffset.width / 2;

            if (_checkLeft(targetOffset, tooltipLayerStyleLeftRight, tooltipOffset, tooltipLayer)) {
                tooltipLayer.style.right = null;
                _checkRight(targetOffset, tooltipLayerStyleLeftRight, tooltipOffset, windowSize, tooltipLayer);
            }
            tooltipLayer.style.bottom = (targetOffset.height + 20) + 'px';
            break;

        case 'top-left-aligned':
        // top-left-aligned is the same as the default top
        case 'top':
            arrowLayer.className = 'introjs-arrow bottom';

            tooltipLayerStyleLeft = 15;

            _checkRight(targetOffset, tooltipLayerStyleLeft, tooltipOffset, windowSize, tooltipLayer);
            tooltipLayer.style.bottom = (targetOffset.height + 20) + 'px';
            break;
        case 'right':
            tooltipLayer.style.left = (targetOffset.width + 20) + 'px';
            if (targetOffset.top + tooltipOffset.height > windowSize.height) {
                // In this case, right would have fallen below the bottom of the screen.
                // Modify so that the bottom of the tooltip connects with the target
                arrowLayer.className = "introjs-arrow left-bottom";
                tooltipLayer.style.top = "-" + (tooltipOffset.height - targetOffset.height - 20) + "px";
            } else {
                arrowLayer.className = 'introjs-arrow left';
            }
            break;
        case 'left':

            // if (!hintMode && this._options.showStepNumbers === true) {
            tooltipLayer.style.top = '15px';
            // }

            if (targetOffset.top + tooltipOffset.height > windowSize.height) {
                // In this case, left would have fallen below the bottom of the screen.
                // Modify so that the bottom of the tooltip connects with the target
                tooltipLayer.style.top = "-" + (tooltipOffset.height - targetOffset.height - 20) + "px";
                arrowLayer.className = 'introjs-arrow right-bottom';
            } else {
                arrowLayer.className = 'introjs-arrow right';
            }
            tooltipLayer.style.right = (targetOffset.width + 20) + 'px';

            break;
        case 'floating':
            arrowLayer.style.display = 'none';

            //we have to adjust the top and left of layer manually for intro items without element
            tooltipLayer.style.left = '50%';
            tooltipLayer.style.top = '50%';
            tooltipLayer.style.marginLeft = '-' + (tooltipOffset.width / 2) + 'px';
            tooltipLayer.style.marginTop = '-' + (tooltipOffset.height / 2) + 'px';

            if (typeof(helperNumberLayer) !== 'undefined' && helperNumberLayer !== null) {
                helperNumberLayer.style.left = '-' + ((tooltipOffset.width / 2) + 18) + 'px';
                helperNumberLayer.style.top = '-' + ((tooltipOffset.height / 2) + 18) + 'px';
            }

            break;
        case 'bottom-right-aligned':
            arrowLayer.className = 'introjs-arrow top-right';

            tooltipLayerStyleRight = 0;
            _checkLeft(targetOffset, tooltipLayerStyleRight, tooltipOffset, tooltipLayer);
            tooltipLayer.style.top = (targetOffset.height + 20) + 'px';
            break;

        case 'bottom-middle-aligned':
            arrowLayer.className = 'introjs-arrow top-middle';

            tooltipLayerStyleLeftRight = targetOffset.width / 2 - tooltipOffset.width / 2;

            // a fix for middle aligned hints
            /*if (hintMode) {
                tooltipLayerStyleLeftRight += 5;
            }*/

            if (_checkLeft(targetOffset, tooltipLayerStyleLeftRight, tooltipOffset, tooltipLayer)) {
                tooltipLayer.style.right = null;
                _checkRight(targetOffset, tooltipLayerStyleLeftRight, tooltipOffset, windowSize, tooltipLayer);
            }
            tooltipLayer.style.top = (targetOffset.height + 20) + 'px';
            break;

        // case 'bottom-left-aligned':
        // Bottom-left-aligned is the same as the default bottom
        // case 'bottom':
        // Bottom going to follow the default behavior
        default:
            arrowLayer.className = 'introjs-arrow top';

            tooltipLayerStyleLeft = 0;
            _checkRight(targetOffset, tooltipLayerStyleLeft, tooltipOffset, windowSize, tooltipLayer);
            tooltipLayer.style.top = (targetOffset.height + 20) + 'px';
    }
    //_addClass(tooltipLayer, 'introjs-' + currentTooltipPosition);
}

function _showTooltip(element) {
    var self = this;

    var referenceLayer = document.createElement('div');
        arrowLayer = document.createElement('div'),
        tooltipLayer = document.createElement('div'),
        tooltipInputLayer = document.createElement('div'),
        buttonsLayer = document.createElement('div');
        removeButtonLayer = document.createElement('div');

    referenceLayer.className = 'introjs-tooltipReferenceLayer';

    //Set reference layer width, height, position.
    _setHelperLayerPosition.call(self, referenceLayer, element);

    //append reference layer to body
    document.body.appendChild(referenceLayer);

//add class to arrow layer
    arrowLayer.className = 'introjs-arrow';

    //add class to tooltip text layer;
    //tooltipTextLayer.className = 'introjs-tooltiptext';
    tooltipInputLayer.innerHTML = ['<input type="text" class="al-custom-input" id="intro-title" placeholder="Enter title..." name="title" />',
        '<textarea rows="2" class="al-custom-input" id="intro-msg" placeholder="Enter message..." name="message" />',
        '</textarea>'].join(' ');;

    //tooltip class to tooltip main layer and append textlayer to it
    tooltipLayer.className = 'introjs-tooltip';
    tooltipLayer.appendChild(tooltipInputLayer);

    //remove button layer
    removeButtonLayer.className = 'al-custom-tooltip-remove';
    removeButtonLayer.innerHTML = '';
    removeButtonLayer.onclick = function(){
        console.log('remove tooltip layer');
        removeTooltip();
    };

    // position buttons
    positionButtons = document.createElement('div');
    positionButtons.className = 'al-box';
    positionButtons.innerHTML = [
        '<span class="al-wrap"><span id="top" class="al-touch"></span></span>',
        '<span class="al-wrap"><span id="right" class="al-touch"></span></span>',
        '<span class="al-wrap"><span id="bottom" class="al-touch"></span></span>',
        '<span class="al-wrap"><span id="left" class="al-touch"></span></span>'
    ].join(' ');

    positionButtons.onclick = function(event){
        _setPostion(event);
    };

    saveStepButton = document.createElement('div');
    saveStepButton.className = 'al-custom-btn';
    saveStepButton.innerHTML = '<a role="button" tabindex="0">SAVE</a>';

    saveStepButton.onclick = function(e){
        e.preventDefault();
        _saveStep();
    };

    buttonsLayer.className = 'al-button-layer';
    buttonsLayer.appendChild(positionButtons);
    buttonsLayer.appendChild(saveStepButton);

    tooltipLayer.appendChild(removeButtonLayer);
    tooltipLayer.appendChild(buttonsLayer);

    //append arrow layer to tooltip and append tooltip layer to reference layer
    // buttonsLayer.className = 'introjs-buttons custom-btn-cont';
    tooltipLayer.appendChild(arrowLayer);
    referenceLayer.appendChild(tooltipLayer);

    _placeTooltip.call(self, element, tooltipLayer, arrowLayer);

    liveStep.tooltipLayer = tooltipLayer;
    liveStep.arrowLayer = arrowLayer;
}


function _getWinSize() {
    if (window.innerWidth !== undefined) {
        return {width: window.innerWidth, height: window.innerHeight};
    } else {
        var D = document.documentElement;
        return {width: D.clientWidth, height: D.clientHeight};
    }
}

function _cGetOffset(element) {
    var elementPosition = {};

    var body = document.body;
    var docEl = document.documentElement;

    var scrollTop = window.pageYOffset || docEl.scrollTop || body.scrollTop;
    var scrollLeft = window.pageXOffset || docEl.scrollLeft || body.scrollLeft;

    if (element instanceof SVGElement) {
        var x = element.getBoundingClientRect();
        elementPosition.top = x.top + scrollTop;
        elementPosition.width = x.width;
        elementPosition.height = x.height;
        elementPosition.left = x.left + scrollLeft;
    } else {
        //set width
        elementPosition.width = element.offsetWidth;

        //set height
        elementPosition.height = element.offsetHeight;

        //calculate element top and left
        var _x = 0;
        var _y = 0;
        while (element && !isNaN(element.offsetLeft) && !isNaN(element.offsetTop)) {
            _x += element.offsetLeft;
            _y += element.offsetTop;
            element = element.offsetParent;
        }
        //set top
        elementPosition.top = _y;
        //set left
        elementPosition.left = _x;
    }

    return elementPosition;
}

function _removeEntry(stringArray, stringToRemove) {
    if (stringArray.indexOf(stringToRemove) > -1) {
        stringArray.splice(stringArray.indexOf(stringToRemove), 1);
    }
}









