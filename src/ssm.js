;(function (window, document, undefined) {
    "use strict";

    var ssm = {},
        states = [],
        debug = false,
        browserWidth = 0,
        currentStates = [],
        resizeTimeout = 50,
        resizeTimer = null,
        stateCounter = 0;

    var browserResizePre = function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(browserResize, resizeTimeout);
    };

    var browserResize = function () {
        var state = null,
            totalStates,
            newBrowserWidth = getWidth();

        totalStates = states.length;

        for (var i = 0; i < totalStates; i++) {
            if(browserWidth >= states[i].minWidth && browserWidth <= states[i].maxWidth){
                
                if(objectInArray(currentStates, states[i])){
                    states[i].onResize();
                }
                else{
                    currentStates.push(states[i]);
                    states[i].onEnter();
                }
            }
            else{
                if(objectInArray(currentStates, states[i])){
                    states[i].onLeave();
                    currentStates = removeObjectInArray(currentStates,states[i]);
                }
            }
        };

        browserWidth = newBrowserWidth;
    };

    var objectInArray = function(arr, obj){
        for (var i = 0; i < arr.length; i++) {
            if(arr[i] === obj){
                return true;
                break;
            }
        };
    }

    var removeObjectInArray = function(arr,obj){
        var length = arr.length - 1;

        for (var i = 0; i < length; i++) {
            if (arr[i] === obj) {
                arr.splice(i, 1);
            }
        }

        return arr;
    }

    ssm.getBrowserWidth = function(){
        return browserWidth;
    };

    //Add a new state
    ssm.addState = function (options) {
        //Setting sensible defaults for a state
        //Max width is set to 99999 for comparative purposes, is bigger than any display on market
        var defaultOptions = {
            id: makeID(),
            minWidth: 0,
            maxWidth: 99999,
            onEnter: function () {},
            onLeave: function () {},
            onResize: function () {}
        };

        //Merge options with defaults
        options = mergeOptions(defaultOptions, options);

        //Add state to the master states array
        states.push(options);

        //Sort 
        states = sortByKey(states, 'minWidth');

        return this;
    };

    //Find and remove the state from the array
    ssm.removeState = function (stateId) {
        for (var i = states.length - 1; i >= 0; i--) {
            if (states[i].id === stateId) {
                states.splice(i, 1);
            }
        }

        return this;
    };

    //Remove multiple states from an array
    ssm.removeStates = function (statesArray) {
        for (var i = statesArray.length - 1; i >= 0; i--) {
            ssm.removeState(statesArray[i]);
        }

        return this;
    };

        //Find and remove the state from the array
    ssm.removeAllStates = function (stateId) {
        states = [];

        return this;
    };

    //Add multiple states from an array
    ssm.addStates = function (statesArray) {
        for (var i = statesArray.length - 1; i >= 0; i--) {
            ssm.addState(statesArray[i]);
        }

        return this;
    };

    ssm.getState = function(id){
        if(typeof(id) === "undefined"){
            return currentStates;
        }
        else{
            return getStateByID(id);
        }
    };

    //Change the timeout before firing the resize function
    ssm.setResizeTimeout = function (milliSeconds) {
        resizeTimeout = milliSeconds;
    };

    //Change the timeout before firing the resize function
    ssm.getResizeTimeout = function () {
        return resizeTimeout;
    };

    ssm.ready = function () {
        var state = null,
            totalStates = states.length;

        for (var i = 0; i < totalStates; i++) {
            state = states[i];

            if (states[i].width >= browserWidth) {
                currentState = states[i];
                currentState.onEnter();
                break;
            }
        }

        return this;
    };

    //Return an array of all the states
    ssm.getStates = function () {
        return states;
    };

    var makeID = function () {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for (var i = 0; i < 10; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    };


    var getWidth = function () {
        var x = 0;
        if (self.innerHeight) {
            x = self.innerWidth;
        } else if (document.documentElement && document.documentElement.clientHeight) {
            x = document.documentElement.clientWidth;
        } else if (document.body) {
            x = document.body.clientWidth;
        }
        return x;
    };


    var mergeOptions = function (obj1, obj2) {
        var obj3 = {};

        for (var attrname in obj1) {
            obj3[attrname] = obj1[attrname];
        }

        for (var attrname in obj2) {
            obj3[attrname] = obj2[attrname];
        }

        return obj3;
    };


    var sortByKey = function (array, key) {
        return array.sort(function (a, b) {
            var x = a[key];
            var y = b[key];
            return ((x < y) ? -1 : ((x > y) ? 1 : 0));
        });
    };

    //Method to get a state based on the ID
    var getStateByID = function(id){
        for (var i = states.length - 1; i >= 0; i--) {
            if(states[i].id === id){
                return states[i];
            }
        };
    };

    browserWidth = getWidth();

    //Attach event
    if (window.attachEvent) {
        window.attachEvent('onresize', browserResizePre);
    } else if (window.addEventListener) {
        window.addEventListener('resize', browserResizePre, true);
    } else {
        //The browser does not support Javascript event binding
    }

    //Expose Simple State Manager
    window.ssm = ssm;

    if (typeof window.define === "function" && window.define.amd) {
        window.define("ssm", [], function () {
            return window.ssm;
        });
    }

})(window, document);