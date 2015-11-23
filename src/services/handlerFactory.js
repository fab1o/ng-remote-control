/**
 * Service used for handeling selection and focusing
 * @author Fabio Costa
 */
(function (base) {
    "use strict";

    var serviceId = "handlerFactory";

    ngRemoteControl.factory(serviceId, ["$log", "inputService", "tvKeyConstant", "timerFactory", handlerFactory]);

    /**
     * @typedef {handlerFactory}
     */
    function handlerFactory($log, inputService, tvKeyConstant, timerFactory) {

        /**
         * @constructor
         * @param {{
         * name: string,
         * isFocused: boolean}|{name: string,
         * [id]: number,
         * [isFocused]: boolean,
         * [debug]: boolean,
         * [autoSelect]: boolean,
         * [autoHover]: boolean,
         * [autoSelectDelay]: number,
         * [autoHoverDelay]: number
         * }} [options]
         */
        function RemoteControlHandler(options) {
            base.call(this);

            options = options || {
                isFocused: false,
                name: "", id: 0,
                isDebug: true,
                autoSelect: false,
                autoHover: false,
                autoSelectDelay: null,
                autoHoverDelay: null
            };

            this.isFocused = false;

            this.context = null;

            this.name = options.name || "RemoteControlHandler";

            this.id = options.id || 0;

            this.isDebug = typeof options.isDebug == "undefined" || options.isDebug;

            options.autoSelect = options.autoSelect || false;
            options.autoHover = options.autoHover || false;

            this.autoSelect = new timerFactory.Timer({
                selectableObject: this,
                name: this.name,
                isEnabled: options.autoSelect,
                functionName: "select",
                delay: options.autoSelectDelay
            });

            this.autoHover = new timerFactory.Timer({
                selectableObject: this,
                name: this.name,
                isEnabled: options.autoHover,
                functionName: "hover",
                delay: options.autoHoverDelay
            });

            if (this.isDebug)
                $log.warn(serviceId, this.name + ".new", options);

            this.map = null;

            this.currentSelected = null;
            this.currentFocused = null;

            var self = this;
            this.listener = function remoteControlListener(e) {

                var keyCode = e.args.keyCode;

                self.fire(RemoteControl.ON_ANY_KEYDOWN, {
                    currentFocused: self.currentFocused,
                    currentSelected: self.currentSelected,
                    keyCode: keyCode
                });

                if (keyCode == tvKeyConstant.UP) {

                    self.up();

                } else if (keyCode == tvKeyConstant.DOWN) {

                    self.down();

                } else if (keyCode == tvKeyConstant.RIGHT) {

                    self.right();

                } else if (keyCode == tvKeyConstant.LEFT) {

                    self.left();

                } else if (keyCode == tvKeyConstant.EXIT) {

                    self.exit();

                } else if (keyCode == tvKeyConstant.ENTER) {

                    self.select();

                } else if (keyCode == tvKeyConstant.RETURN) {

                    self.back();

                } else if (keyCode == tvKeyConstant.PLAY) {

                    self.play();

                } else if (keyCode == tvKeyConstant.PAUSE) {

                    self.pause();

                } else if (keyCode == tvKeyConstant.STOP) {

                    self.stop();

                } else if (keyCode == tvKeyConstant.RW) {

                    self.rewind();

                } else if (keyCode == tvKeyConstant.FF) {

                    self.fastForward();

                } else if (keyCode == tvKeyConstant.RED) {

                    self.red();

                } else if (keyCode == tvKeyConstant.GREEN) {

                    self.green();

                } else if (keyCode == tvKeyConstant.YELLOW) {

                    self.yellow();

                } else if (keyCode == tvKeyConstant.BLUE) {

                    self.blue();

                } else if (keyCode == tvKeyConstant.MUTE) {
                    self.mute();
                } else if (keyCode == tvKeyConstant.CC) {
                    self.cc();
                } else if (keyCode == tvKeyConstant.VOLDOWN) {
                    self.voldown();
                } else if (keyCode == tvKeyConstant.VOLUP) {
                    self.volup();
                }

            };

            if (options.isFocused)
                self.focus();

        };

        RemoteControlHandler.prototype = new base();
        RemoteControlHandler.prototype.constructor = RemoteControlHandler;
        /**
         * Sets the map
         * @param {Map} map
         * @param {{focusOnNode: Node, [reset]: boolean}} [options]
         */
        RemoteControlHandler.prototype.setMap = function (map, options) {

            //check if map is real
            if (map != null && !(map instanceof ngRemoteControl.DataStructures.Map)) {
                if (this.isDebug)
                    $log.error(serviceId, this.name + ".setMap", "argument 'map' is not a Map");
                return false;
            }

            options = options || {
                reset: map == null,
                focusOnNode: null
            };

            options.focusOnNode = options.focusOnNode || null;

            if (typeof options.reset == "undefined" || options.reset == null)
                options.reset = map == null || map.head == null;

            if (options.reset) {

                if (this.currentFocused)
                    this.currentFocused.blur();

                if (this.currentSelected)
                    this.currentSelected.deselect();

                this.currentSelected = null;
                this.currentFocused = null;
            }

            if (map && map.head) {

                if (options.focusOnNode) {
                    this.currentFocused = options.focusOnNode;
                } else {
                    this.currentFocused = map.findFocused();
                    //map.clearSearch();
                    this.currentSelected = map.findSelected();
                    //map.clearSearch();
                }
                if (this.currentFocused)
                    this.focus();
            }

            this.map = map;

        };

        /**
         * Returns true if this handler has a valid map
         * @returns {boolean}
         */
        RemoteControlHandler.prototype.hasMap = function () {

            if (this.map == null || !(this.map instanceof ngRemoteControl.DataStructures.Map))
                return false;

            return this.map.head != null;

        };

        RemoteControlHandler.prototype.up = function () {

            if (this.isDebug)
                $log.info(serviceId, this.name + ".up");

            this.fire(RemoteControl.ON_UP, {
                currentFocused: this.currentFocused,
                currentSelected: this.currentSelected
            });
            this.fire(RemoteControl.ON_UP_DOWN_LEFT_RIGHT, {
                currentFocused: this.currentFocused,
                currentSelected: this.currentSelected,
                keyCode: tvKeyConstant.UP
            });

            if (this.currentFocused == null) {
                if (this.isDebug)
                    $log.info(serviceId, this.name + ".currentFocused is null");
                return false;
            }

            if (this.currentFocused.up == null) {
                if (this.isDebug)
                    $log.info(serviceId, this.name + ".currentFocused.up is null");
                return false;
            }

            this.autoSelect.cancelTimer(RemoteControl.ON_UP);
            this.autoHover.cancelTimer(RemoteControl.ON_UP);

            this.currentFocused.blur();

            this.currentFocused = this.currentFocused.up;

            this.currentFocused.focus();

            this.autoHover.startTimer(RemoteControl.ON_UP);
            this.autoSelect.startTimer(RemoteControl.ON_UP);

            return true;

        };

        RemoteControlHandler.prototype.down = function () {

            if (this.isDebug)
                $log.info(serviceId, this.name + ".down");

            this.fire(RemoteControl.ON_DOWN, {
                currentFocused: this.currentFocused,
                currentSelected: this.currentSelected
            });
            this.fire(RemoteControl.ON_UP_DOWN_LEFT_RIGHT, {
                currentFocused: this.currentFocused,
                currentSelected: this.currentSelected,
                keyCode: tvKeyConstant.DOWN
            });

            if (this.currentFocused == null) {
                if (this.isDebug)
                    $log.info(serviceId, this.name + ".currentFocused is null");
                return false;
            }

            if (this.currentFocused.down == null) {
                if (this.isDebug)
                    $log.info(serviceId, this.name + ".currentFocused.down is null");
                return false;
            }

            this.autoSelect.cancelTimer(RemoteControl.ON_DOWN);
            this.autoHover.cancelTimer(RemoteControl.ON_DOWN);

            this.currentFocused.blur();

            this.currentFocused = this.currentFocused.down;

            this.currentFocused.focus();

            this.autoHover.startTimer(RemoteControl.ON_DOWN);
            this.autoSelect.startTimer(RemoteControl.ON_DOWN);

            return true;

        };

        RemoteControlHandler.prototype.left = function () {

            if (this.isDebug)
                $log.info(serviceId, this.name + ".left");

            this.fire(RemoteControl.ON_LEFT, {
                currentFocused: this.currentFocused,
                currentSelected: this.currentSelected
            });
            this.fire(RemoteControl.ON_UP_DOWN_LEFT_RIGHT, {
                currentFocused: this.currentFocused,
                currentSelected: this.currentSelected,
                keyCode: tvKeyConstant.LEFT
            });

            if (this.currentFocused == null) {
                if (this.isDebug)
                    $log.info(serviceId, this.name + ".currentFocused is null");
                return false;
            }

            if (this.currentFocused.left == null) {
                if (this.isDebug)
                    $log.info(serviceId, this.name + ".currentFocused.left is null");
                return false;
            }

            this.autoSelect.cancelTimer(RemoteControl.ON_LEFT);
            this.autoHover.cancelTimer(RemoteControl.ON_LEFT);

            this.currentFocused.blur();

            this.currentFocused = this.currentFocused.left;

            this.currentFocused.focus();

            this.autoHover.startTimer(RemoteControl.ON_LEFT);
            this.autoSelect.startTimer(RemoteControl.ON_LEFT);

            return true;


        };


        RemoteControlHandler.prototype.right = function () {

            if (this.isDebug)
                $log.info(serviceId, this.name + ".right");

            this.fire(RemoteControl.ON_RIGHT, {
                currentFocused: this.currentFocused,
                currentSelected: this.currentSelected
            });
            this.fire(RemoteControl.ON_UP_DOWN_LEFT_RIGHT, {
                currentFocused: this.currentFocused,
                currentSelected: this.currentSelected,
                keyCode: tvKeyConstant.RIGHT
            });

            if (this.currentFocused == null) {
                if (this.isDebug)
                    $log.info(serviceId, this.name + ".currentFocused is null");
                return false;
            }

            if (this.currentFocused.right == null) {
                if (this.isDebug)
                    $log.info(serviceId, this.name + ".currentFocused.right is null");
                return false;
            }

            this.autoSelect.cancelTimer(RemoteControl.ON_RIGHT);
            this.autoHover.cancelTimer(RemoteControl.ON_RIGHT);

            this.currentFocused.blur();

            if (this.currentFocused.right instanceof ngRemoteControl.DataStructures.Node) {

                this.currentFocused = this.currentFocused.right;

                this.currentFocused.focus();

                this.autoHover.startTimer(RemoteControl.ON_RIGHT);
                this.autoSelect.startTimer(RemoteControl.ON_RIGHT);

            }

            return true;

        };

        /**
         * Exists
         * @returns {boolean}
         */
        RemoteControlHandler.prototype.exit = function () {

            this.autoSelect.cancelTimer(RemoteControl.ON_EXIT);
            this.autoHover.cancelTimer(RemoteControl.ON_EXIT);

            if (this.isDebug)
                $log.info(serviceId, this.name + ".exit");

            this.fire(RemoteControl.ON_EXIT, null);

            return true;

        };

        /**
         * Selects the currentFocused node
         * @param {{selectOnNode: Node}} [options]
         * @returns {boolean}
         */
        RemoteControlHandler.prototype.select = function (options) {

            options = options || {
                selectOnNode: null
            };

            options.selectOnNode = options.selectOnNode || null;

            this.autoSelect.cancelTimer(RemoteControl.ON_SELECT);
            this.autoHover.cancelTimer(RemoteControl.ON_SELECT);

            if (this.isDebug)
                $log.warn(serviceId, this.name + ".select");

            if (this.currentFocused == null && options.selectOnNode == null)
                return false;

            if (this.currentSelected)
                this.currentSelected.deselect();

            if (options.selectOnNode) {
                options.selectOnNode.select();
                this.currentSelected = options.selectOnNode;
            } else {
                this.currentFocused.select();
                this.currentSelected = this.currentFocused;
            }

            //if (this.context) {
            //    this.context.currentSelected = this.currentSelected;
            //}

            this.fire(RemoteControl.ON_SELECT, {
                currentFocused: this.currentFocused,
                currentSelected: this.currentSelected
            });

            return true;
        };

        /**
         * Fires hover event of the currentFocused node
         * @returns {boolean}
         */
        RemoteControlHandler.prototype.hover = function () {

            this.autoSelect.cancelTimer(RemoteControl.ON_HOVER);
            this.autoHover.cancelTimer(RemoteControl.ON_HOVER);

            if (this.isDebug)
                $log.warn(serviceId, this.name + ".hover");

            if (this.currentFocused == null)
                return false;

            this.fire(RemoteControl.ON_HOVER, {
                currentFocused: this.currentFocused,
                currentSelected: this.currentSelected
            });

            return true;
        };

        RemoteControlHandler.prototype.back = function () {

            this.autoSelect.cancelTimer(RemoteControl.ON_RETURN);
            this.autoHover.cancelTimer(RemoteControl.ON_RETURN);

            if (this.isDebug)
                $log.info(serviceId, this.name + ".back");

            this.fire(RemoteControl.ON_RETURN, {
                currentFocused: this.currentFocused,
                currentSelected: this.currentSelected
            });

        };

        RemoteControlHandler.prototype.play = function () {

            this.autoSelect.cancelTimer(RemoteControl.ON_PLAY);
            this.autoHover.cancelTimer(RemoteControl.ON_PLAY);

            if (this.isDebug)
                $log.info(serviceId, this.name + ".play");

            this.fire(RemoteControl.ON_PLAY, {
                currentFocused: this.currentFocused,
                currentSelected: this.currentSelected
            });

        };

        RemoteControlHandler.prototype.mute = function () {

            this.autoSelect.cancelTimer(RemoteControl.ON_MUTE);
            this.autoHover.cancelTimer(RemoteControl.ON_MUTE);

            if (this.isDebug)
                $log.info(serviceId, this.name + ".mute");

            this.fire(RemoteControl.ON_MUTE, {
                currentFocused: this.currentFocused,
                currentSelected: this.currentSelected
            });

        };

        RemoteControlHandler.prototype.volup = function () {

            this.autoSelect.cancelTimer(RemoteControl.ON_VOLUP);
            this.autoHover.cancelTimer(RemoteControl.ON_VOLUP);

            if (this.isDebug)
                $log.info(serviceId, this.name + ".volup");

            this.fire(RemoteControl.ON_VOLUP, {
                currentFocused: this.currentFocused,
                currentSelected: this.currentSelected
            });

        };

        RemoteControlHandler.prototype.voldown = function () {

            this.autoSelect.cancelTimer(RemoteControl.ON_VOLDOWN);
            this.autoHover.cancelTimer(RemoteControl.ON_VOLDOWN);

            if (this.isDebug)
                $log.info(serviceId, this.name + ".voldown");

            this.fire(RemoteControl.ON_VOLDOWN, {
                currentFocused: this.currentFocused,
                currentSelected: this.currentSelected
            });

        };


        RemoteControlHandler.prototype.cc = function () {

            this.autoSelect.cancelTimer(RemoteControl.ON_CC);
            this.autoHover.cancelTimer(RemoteControl.ON_CC);

            if (this.isDebug)
                $log.info(serviceId, this.name + ".cc");

            this.fire(RemoteControl.ON_CC, {
                currentFocused: this.currentFocused,
                currentSelected: this.currentSelected
            });

        };

        RemoteControlHandler.prototype.stop = function () {

            this.autoSelect.cancelTimer(RemoteControl.ON_STOP);
            this.autoHover.cancelTimer(RemoteControl.ON_STOP);

            if (this.isDebug)
                $log.info(serviceId, this.name + ".stop");

            this.fire(RemoteControl.ON_STOP, {
                currentFocused: this.currentFocused,
                currentSelected: this.currentSelected
            });

        };

        RemoteControlHandler.prototype.pause = function () {

            this.autoSelect.cancelTimer(RemoteControl.ON_PAUSE);
            this.autoHover.cancelTimer(RemoteControl.ON_PAUSE);

            if (this.isDebug)
                $log.info(serviceId, this.name + ".pause");

            this.fire(RemoteControl.ON_PAUSE, {
                currentFocused: this.currentFocused,
                currentSelected: this.currentSelected
            });

        };

        RemoteControlHandler.prototype.rewind = function () {

            this.autoSelect.cancelTimer(RemoteControl.ON_REWIND);
            this.autoHover.cancelTimer(RemoteControl.ON_REWIND);

            if (this.isDebug)
                $log.info(serviceId, this.name + ".rewind");

            this.fire(RemoteControl.ON_REWIND, {
                currentFocused: this.currentFocused,
                currentSelected: this.currentSelected
            });

        };

        RemoteControlHandler.prototype.fastForward = function () {

            this.autoSelect.cancelTimer(RemoteControl.ON_FORWARD);
            this.autoHover.cancelTimer(RemoteControl.ON_FORWARD);

            if (this.isDebug)
                $log.info(serviceId, this.name + ".fastForward");

            this.fire(RemoteControl.ON_FORWARD, {
                currentFocused: this.currentFocused,
                currentSelected: this.currentSelected
            });

        };

        RemoteControlHandler.prototype.onToolsPresed = function () {

            this.autoSelect.cancelTimer(RemoteControl.ON_TOOLS);
            this.autoHover.cancelTimer(RemoteControl.ON_TOOLS);

            if (this.isDebug)
                $log.info(serviceId, this.name + ".onToolsPresed");

            this.fire(RemoteControl.ON_TOOLS, {
                currentFocused: this.currentFocused,
                currentSelected: this.currentSelected
            });

        };

        RemoteControlHandler.prototype.onInfoPressed = function () {

            this.autoSelect.cancelTimer(RemoteControl.ON_INFO);
            this.autoHover.cancelTimer(RemoteControl.ON_INFO);

            if (this.isDebug)
                $log.info(serviceId, this.name + ".onInfoPressed");

            this.fire(RemoteControl.ON_INFO, {
                currentFocused: this.currentFocused,
                currentSelected: this.currentSelected
            });

        };


        RemoteControlHandler.prototype.red = function () {

            this.autoSelect.cancelTimer(RemoteControl.ON_RED_BUTTON);
            this.autoHover.cancelTimer(RemoteControl.ON_RED_BUTTON);

            if (this.isDebug)
                $log.info(serviceId, this.name + ".red");

            this.fire(RemoteControl.ON_SPECIAL_BUTTON, {
                button: this.A_BUTTON,
                currentFocused: this.currentFocused,
                currentSelected: this.currentSelected
            });

            this.fire(RemoteControl.ON_RED_BUTTON, {
                currentFocused: this.currentFocused,
                currentSelected: this.currentSelected
            });

        };


        RemoteControlHandler.prototype.green = function () {

            this.autoSelect.cancelTimer(RemoteControl.ON_GREEN_BUTTON);
            this.autoHover.cancelTimer(RemoteControl.ON_GREEN_BUTTON);

            if (this.isDebug)
                $log.info(serviceId, this.name + ".green");

            this.fire(RemoteControl.ON_SPECIAL_BUTTON, {
                button: this.B_BUTTON,
                currentFocused: this.currentFocused,
                currentSelected: this.currentSelected
            });

            this.fire(RemoteControl.ON_GREEN_BUTTON, {
                currentFocused: this.currentFocused,
                currentSelected: this.currentSelected
            });

        };


        RemoteControlHandler.prototype.yellow = function () {

            this.autoSelect.cancelTimer(RemoteControl.ON_YELLOW_BUTTON);
            this.autoHover.cancelTimer(RemoteControl.ON_YELLOW_BUTTON);

            if (this.isDebug)
                $log.info(serviceId, this.name + ".yellow");

            this.fire(RemoteControl.ON_SPECIAL_BUTTON, {
                button: this.C_BUTTON,
                currentFocused: this.currentFocused,
                currentSelected: this.currentSelected
            });

            this.fire(RemoteControl.ON_YELLOW_BUTTON, {
                currentFocused: this.currentFocused,
                currentSelected: this.currentSelected
            });

        };


        RemoteControlHandler.prototype.blue = function () {

            this.autoSelect.cancelTimer(RemoteControl.ON_BLUE_BUTTON);
            this.autoHover.cancelTimer(RemoteControl.ON_BLUE_BUTTON);

            if (this.isDebug)
                $log.info(serviceId, this.name + ".blue");

            this.fire(RemoteControl.ON_SPECIAL_BUTTON, {
                button: this.D_BUTTON,
                currentFocused: this.currentFocused,
                currentSelected: this.currentSelected
            });

            this.fire(RemoteControl.ON_BLUE_BUTTON, {
                currentFocused: this.currentFocused,
                currentSelected: this.currentSelected
            });

        };

        /**
         * Removes focus on this handler and optionally on the current focused item
         * @param {{[blurCurrentFocused]: boolean, [cancelTimer]: boolean}} [options]
         * @returns {boolean}
         */
        RemoteControlHandler.prototype.blur = function (options) {

            this.autoHover.cancelTimer(RemoteControl.ON_BLUR);

            options = options || {
                blurCurrentFocused: false,
                cancelTimer: true
            };

            options.blurCurrentFocused = options.blurCurrentFocused || false;

            if (typeof options.cancelTimer == "undefined" || options.cancelTimer == null)
                options.cancelTimer = true;

            if (options.cancelTimer) {
                this.autoSelect.cancelTimer(RemoteControl.ON_BLUR);
            }

            if (!this.isFocused)
                return true;

            if (this.isDebug) {
                $log.info(serviceId, this.name + ".blur.NOT.listening");
            }

            this.isFocused = false;

            inputService.removeListener(inputService.ON_KEY_DOWN, this.listener);

            if (options.blurCurrentFocused) {

                if (this.currentFocused)
                    this.currentFocused.blur();
            }

            this.fire(RemoteControl.ON_BLUR, {
                currentFocused: this.currentFocused,
                currentSelected: this.currentSelected
            });

        };

        /**
         * Receive focus
         * @param {{
         * [forced]: boolean,
         * [firstNode]: boolean,
         * [focusCurrentSelected]: boolean,
         * [refocus]: boolean
         * }} [options]
         * @returns {boolean}
         */
        RemoteControlHandler.prototype.focus = function (options) {

            options = options || {
                forced: false, //focus at all costs
                firstNode: false, //focus on the first node of the map
                focusCurrentSelected: false, //focus on the current selected (default behavior)
                refocus: false //re-focus means to focus again but only if this handler has focus
            };

            options.refocus = options.refocus || false;
            options.forced = options.forced || false;
            options.firstNode = options.firstNode || false;
            options.focusCurrentSelected = options.focusCurrentSelected || false;

            //if focused but not forced, then return
            if (this.isFocused && options.forced == false && options.refocus == false)
                return false;

            if (options.refocus && !this.isFocused) //if refocusing, make sure this handler has focus
                return false;

            if (this.isDebug) {
                $log.info(serviceId, this.name + ".focus.YES.listening");
            }

            this.isFocused = true;

            if (options.focusCurrentSelected && this.currentSelected) {

                if (this.currentFocused)
                    this.currentFocused.blur();

                this.currentFocused = this.currentSelected;
                this.currentFocused.focus();

            } else if (this.currentFocused) {

                this.currentFocused.focus();

            } else {

                this.setFocusToFirstNode();
            }


            if (this.currentFocused && this.currentFocused.isFocused) {
                this.autoHover.startTimer(RemoteControl.ON_FOCUS);
            }

            inputService.addListener(inputService.ON_KEY_DOWN, this.listener, false);

            this.fire(RemoteControl.ON_FOCUS);

            return true;
        };

        RemoteControlHandler.prototype.fixfocus = function () {

            $log.info(serviceId, this.name + ".fixfocus");

            if (!this.isFocused)
                return false;

            this.focus();

            return true;
        };

        RemoteControlHandler.prototype.refocus = function () {

            $log.info(serviceId, this.name + ".refocus");

            this.focus({
                refocus: true
            });

        };

        /**
         * Sets focus to a node. Only execute this once at the custom initialization
         * @param {Node} node
         */
        RemoteControlHandler.prototype.setFocusToNode = function (node,options) {

            if (node == null)
                return false;

            //check if it's a real node
            if (!(node instanceof ngRemoteControl.DataStructures.Node)) {
                if (this.isDebug)
                    $log.error(serviceId, this.name + ".setFocusToNode", "argument 'node' is not a Node");
                return false;
            }

            if (!this.exists(node))
                return false;

            $log.info(serviceId, this.name + ".setFocusToNode");

            if (this.currentFocused)
                this.currentFocused.blur();

            this.currentFocused = node;

            return this.focus(options);

        };

        /**
         * Sets focus to a node. Only execute this once at the custom initialization
         * @param {Node} node
         */
        RemoteControlHandler.prototype.setSelectedToNode = function (node) {

            if (node == null)
                return false;

            //check if it's a real node
            if (!(node instanceof ngRemoteControl.DataStructures.Node)) {
                if (this.isDebug)
                    $log.error(serviceId, this.name + ".setSelectedToNode", "argument 'node' is not a Node");
                return false;
            }

            if (!this.exists(node))
                return false;

            if (this.isDebug)
                $log.info(serviceId, this.name + ".setSelectedToNode");

            if (this.currentSelected)
                this.currentSelected.deselect();

            this.currentSelected = node;
            this.currentSelected.select();

            return true;

        };

        /**
         * Check if given node exists in this handler's map
         * @param node
         * @returns {boolean}
         */
        RemoteControlHandler.prototype.exists = function (node) {

            var found = false;

            //check if node is in the map
            if (this.hasMap() && this.map.nodes) {

                for (var n in this.map.nodes) {
                    if (this.map.nodes[n] === node) {
                        found = true;
                        break;
                    }
                }

            }

            if (!found) {
                if (this.isDebug)
                    $log.error(serviceId, this.name + ".exists", "argument 'node' is not in this map");
            }

            return found;
        };

        /**
         * Deselects current selected
         */
        RemoteControlHandler.prototype.deselect = function () {

            if (this.currentSelected)
                this.currentSelected.deselect();

            return true;

        };

        /**
         * Sets focus to the first node of the map
         */
        RemoteControlHandler.prototype.setFocusToFirstNode = function () {

            if (this.isDebug)
                $log.info(serviceId, this.name + ".setFocusToFirstNode");

            if (!this.hasMap())
                return false;

            if (this.currentFocused)
                this.currentFocused.blur();

            this.currentFocused = this.map.head;
            this.currentFocused.focus();
            this.autoHover.startTimer(RemoteControl.ON_FOCUS);
            return true;

        };

        /**
         * Selects the first node of the map
         */
        RemoteControlHandler.prototype.setSelectedToFirstNode = function () {

            if (this.map == null || this.map.head == null)
                return false;

            if (this.isDebug)
                $log.info(serviceId, this.name + ".setSelectedToFirstNode");

            if (this.currentSelected)
                this.currentSelected.deselect();

            this.currentSelected = this.map.head;
            this.currentSelected.select();

            return true;

        };

        /**
         * * Returns true or false if the name of this handler is the same as given
         * @param {string} handlerName
         * @returns {*}
         */
        RemoteControlHandler.prototype.is = function (handlerName) {
            return this.name == handlerName;
        };

        /**
         * Returns the name of this handler
         * @returns {string}
         */
        RemoteControlHandler.prototype.toString = function () {
            return this.name;
        };

        return {
            RemoteControlHandler: RemoteControlHandler
        };

    }

})(ngRemoteControl.EventManager.EventTarget);