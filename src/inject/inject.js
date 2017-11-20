/*
chrome.extension.sendMessage({}, function(response) {
	var readyStateCheckInterval = setInterval(function() {
	if (document.readyState === "complete") {
		clearInterval(readyStateCheckInterval);

		// ----------------------------------------------------------
		// This part of the script triggers when page is done loading
		console.log("Hello. This message was sent from scripts/inject.js");
		// ----------------------------------------------------------

	}
	}, 10);
});*/

var eleSelector, pastElement;

//popup html content to get intro title and position
var input = ['<input type="text" class="custom-input" id="intro-title" placeholder="Enter title..." name="title" />',
    '<textarea rows="2" class="custom-input" id="intro-msg" placeholder="Enter message..." name="message" /></textarea>',
    '<div class="box">',
    '<span class="wrap"><span class="touch"></span></span>',
    '<span class="wrap"><span class="touch"></span></span>',
    '<span class="wrap"><span class="touch"></span></span>',
    '<span class="wrap"><span class="touch"></span></span>',
    '</div>'].join('');

// custom functions




// intro js functions

/**
 * Set tooltip left so it doesn't go off the right side of the window
 *
 * @return boolean true, if tooltipLayerStyleLeft is ok.  false, otherwise.
 */
function _checkRight(targetOffset, tooltipLayerStyleLeft, tooltipOffset, windowSize, tooltipLayer) {
    if (targetOffset.left + tooltipLayerStyleLeft + tooltipOffset.width > windowSize.width) {
        // off the right side of the window
        tooltipLayer.style.left = (windowSize.width - tooltipOffset.width - targetOffset.left) + 'px';
        return false;
    }
    tooltipLayer.style.left = tooltipLayerStyleLeft + 'px';
    return true;
}

/**
 * Set tooltip right so it doesn't go off the left side of the window
 *
 * @return boolean true, if tooltipLayerStyleRight is ok.  false, otherwise.
 */
function _checkLeft(targetOffset, tooltipLayerStyleRight, tooltipOffset, tooltipLayer) {
    if (targetOffset.left + targetOffset.width - tooltipLayerStyleRight - tooltipOffset.width < 0) {
        // off the left side of the window
        tooltipLayer.style.left = (-targetOffset.left) + 'px';
        return false;
    }
    tooltipLayer.style.right = tooltipLayerStyleRight + 'px';
    return true;
}

/**
 * Determines the position of the tooltip based on the position precedence and availability
 * of screen space.
 *
 * @param {Object}    targetElement
 * @param {Object}    tooltipLayer
 * @param {String}    desiredTooltipPosition
 * @return {String}   calculatedPosition
 */
function _determineAutoPosition(targetElement, tooltipLayer, desiredTooltipPosition) {

    // Take a clone of position precedence. These will be the available
    var possiblePositions = this._options.positionPrecedence.slice();

    var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    var scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

    var windowSize = _getWinSize();
    var tooltipHeight = _getOffset(tooltipLayer).height + 10;
    var tooltipWidth = _getOffset(tooltipLayer).width + 20;
    var targetOffset = _getOffset(targetElement);

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

    // only top and bottom positions have optional alignments
    if (['top', 'bottom'].indexOf(calculatedPosition) !== -1) {
        calculatedPosition += _determineAutoAlignment(targetOffset.left, tooltipWidth, windowSize, desiredAlignment);
    }

    return calculatedPosition;
}

/**
 * auto-determine alignment
 * @param {Integer}  offsetLeft
 * @param {Integer}  tooltipWidth
 * @param {Object}   windowSize
 * @param {String}   desiredAlignment
 * @return {String}  calculatedAlignment
 */
function _determineAutoAlignment (offsetLeft, tooltipWidth, windowSize, desiredAlignment) {
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

/**
 * Remove an entry from a string array if it's there, does nothing if it isn't there.
 *
 * @param {Array} stringArray
 * @param {String} stringToRemove
 */
function _removeEntry(stringArray, stringToRemove) {
    if (stringArray.indexOf(stringToRemove) > -1) {
        stringArray.splice(stringArray.indexOf(stringToRemove), 1);
    }
}

function _addClass(element, className) {
    console.log(element, className);
    if (element instanceof SVGElement) {
        // svg
        var pre = element.getAttribute('class') || '';

        element.setAttribute('class', pre + ' ' + className);
    } else {
        if (element.classList !== undefined) {
            // check for modern classList property
            var classes = className.split(' ');
            _forEach(classes, function (cls) {
                element.classList.add( cls );
            });
        } else if (!element.className.match( className )) {
            // check if element doesn't already have className
            element.className += ' ' + className;
        }
    }
}

function _forEach(arr, forEachFnc, completeFnc) {
    // in case arr is an empty query selector node list
    if (arr) {
        for (var i = 0, len = arr.length; i < len; i++) {
            forEachFnc(arr[i], i);
        }
    }

    if (typeof(completeFnc) === 'function') {
        completeFnc();
    }
}


function _showTooltip(element) {
    var self = this;
    var referenceLayer = document.createElement('div'),
        arrowLayer = document.createElement('div'),
        tooltipLayer = document.createElement('div'),
        tooltipTextLayer = document.createElement('div'),
        buttonsLayer = document.createElement('div');
    referenceLayer.className = 'introjs-tooltipReferenceLayer';

    //Set reference layer width, height, position.
    _setHelperLayerPosition.call(self, referenceLayer, element);

    //append reference layer to body
    d.body.appendChild(referenceLayer);

    //add class to arrow layer
    arrowLayer.className = 'introjs-arrow';

    //add class to tooltip text layer;
    tooltipTextLayer.className = 'introjs-tooltiptext';
    tooltipTextLayer.innerHTML = input;

    //tooltip class to tooltip main layer and append textlayer to it
    tooltipLayer.className = 'introjs-tooltip';
    tooltipLayer.appendChild(tooltipTextLayer);

    //append arrow layer to tooltip and append tooltip layer to reference layer
    buttonsLayer.className = 'introjs-buttons custom-btn-cont';
    tooltipLayer.appendChild(arrowLayer);
    referenceLayer.appendChild(tooltipLayer);

    //next button
    saveTooltipButton = document.createElement('a');

    saveTooltipButton.onclick = function () {
        _saveStep.call(self);
    };

    _setAnchorAsButton(saveTooltipButton);
    saveTooltipButton.innerHTML = 'SAVE';
    saveTooltipButton.className = 'custom-btn';
    buttonsLayer.appendChild(saveTooltipButton);
    tooltipLayer.appendChild(buttonsLayer);
    _placeTooltip.call(self, element, tooltipLayer, arrowLayer);

}