/**
 * Service used for managing input (keyboard and Samsung SmartTV remote control)
 * @author Fabio Costa
 */
(function (base) {
    "use strict";

    var serviceId = "inputService";

    ngRemoteControl.service(serviceId, ["appConstant", "tvApiService", "tvKeyConstant", "$log", inputService]);

    /**
     * Initializes inputService
     * @returns {inputService}
     */
    function inputService(appConstant, tvApiService, tvKeyConstant, $log) {

        base.call(this);

        this.ON_KEY_DOWN = "onKeyDown";

        /**
         * Called from startupService to initialize remote control input
         */
        this.init = function () {

            $log.info(serviceId, "init");

            // Enable handling of keys from TV API
            if (appConstant.IS_SAMSUNG_TV) {
                initSamsungTV();
            } else {
                initWeb();
            }

            return true;
        };

        /**
         * Triggered key from inputKey directive
         * @param {*} event
         */
        this.onKeyDown = function (event) {

            var keyCode = event.keyCode;

            // Convert the keyCode into a (readable) character - used primarily for logging
            var keyChar = null;

            switch (keyCode) {
                case tvKeyConstant.CC:
                    keyChar = "KEY.CC";
                    break;

                case tvKeyConstant.MUTE:
                    keyChar = "KEY.MUTE";
                    break;

                case tvKeyConstant.VOLUP:
                    keyChar = "KEY.VOLUP";
                    break;
                case tvKeyConstant.VOLDOWN:
                    keyChar = "KEY.VOLDOWN";
                    break;
                case tvKeyConstant.LEFT:
                    keyChar = "KEY.LEFT";
                    break;

                case tvKeyConstant.RIGHT:
                    keyChar = "KEY.RIGHT";
                    break;

                case tvKeyConstant.UP:
                    keyChar = "KEY.UP";
                    break;
                case tvKeyConstant.DOWN:
                    keyChar = "KEY.DOWN";
                    break;

                case tvKeyConstant.EXIT:
                    tvApiService.preventDefault(event);
                    keyChar = "KEY.EXIT";
                    break;

                case tvKeyConstant.ENTER:
                    keyChar = "KEY.ENTER";
                    break;

                case tvKeyConstant.RETURN:
                    tvApiService.preventDefault(event);
                    keyChar = "KEY.RETURN";
                    break;

                case tvKeyConstant.RED:
                    keyChar = "KEY.RED";
                    break;

                case tvKeyConstant.GREEN:
                    keyChar = "KEY.GREEN";
                    break;

                case tvKeyConstant.BLUE:
                    keyChar = "KEY.BLUE";
                    break;

                case tvKeyConstant.YELLOW:
                    keyChar = "KEY.YELLOW";
                    break;

                case tvKeyConstant.PLAY:
                    keyChar = "KEY.PLAY";
                    break;

                case tvKeyConstant.PAUSE:
                    keyChar = "KEY.PAUSE";
                    break;

                case tvKeyConstant.STOP:
                    keyChar = "KEY.STOP";
                    break;

                case tvKeyConstant.RW:
                    keyChar = "KEY.RW";
                    break;

                case tvKeyConstant.FF:
                    keyChar = "KEY.FF";
                    break;

                case tvKeyConstant.INFO:
                    keyChar = "KEY.INFO";
                    break;

                case tvKeyConstant.TOOLS:
                    keyChar = "KEY.TOOLS";
                    break;

                default:
                    keyChar = "NOT.DEFINED";
                    break;
            }

            if (keyChar)
                $log.info(serviceId, "onKeyDown(keyCode: " + keyCode + ", keyChar: " + keyChar + ")");

            this.fire(this.ON_KEY_DOWN, { keyCode: keyCode });

            return true;
        };

        /***
         * Initializes remote control input from Samsung TV
         */
        function initSamsungTV() {

            $log.info(serviceId, "initSamsungTV");

            var tvKey = new Common.API.TVKeyValue();

            // Replace the inputConstant keys with the TV keys

            tvKeyConstant.MUTE = tvKey.KEY_MUTE;
            tvKeyConstant.VOLDOWN = tvKey.KEY_VOL_DOWN;
            tvKeyConstant.VOLUP = tvKey.KEY_VOL_UP;
            tvKeyConstant.PANELVOLDOWN = tvKey.KEY_PANEL_VOL_DOWN;
            tvKeyConstant.PANELVOLUP = tvKey.KEY_PANEL_VOL_UP;

            tvKeyConstant.LEFT = tvKey.KEY_LEFT;
            tvKeyConstant.RIGHT = tvKey.KEY_RIGHT;

            tvKeyConstant.UP = tvKey.KEY_UP;
            tvKeyConstant.DOWN = tvKey.KEY_DOWN;

            tvKeyConstant.EXIT = tvKey.KEY_EXIT;
            tvKeyConstant.ENTER = tvKey.KEY_ENTER;
            tvKeyConstant.RETURN = tvKey.KEY_RETURN;

            tvKeyConstant.RED = tvKey.KEY_RED;
            tvKeyConstant.GREEN = tvKey.KEY_GREEN;
            tvKeyConstant.BLUE = tvKey.KEY_BLUE;
            tvKeyConstant.YELLOW = tvKey.KEY_YELLOW;

            tvKeyConstant.PLAY = tvKey.KEY_PLAY;
            tvKeyConstant.PAUSE = tvKey.KEY_PAUSE;
            tvKeyConstant.STOP = tvKey.KEY_STOP;
            tvKeyConstant.RW = tvKey.KEY_RW;
            tvKeyConstant.FF = tvKey.KEY_FF;

            tvKeyConstant.INFO = tvKey.KEY_INFO;
            tvKeyConstant.TOOLS = tvKey.KEY_TOOLS;
            tvKeyConstant.CC = tvKey.KEY_SUBTITLE;

            return true;
        };

        /**
         * Initializes keyboard input from web browser
         */
        function initWeb() {

            $log.info(serviceId, "initWeb");

            // Listen for mouse movement on document to return focus back to input anchor
            document.onmousemove = function() {
                var inputKeyAnchor = document.getElementById("input-key-anchor");
                inputKeyAnchor.focus();
            };

            return true;
        };

        return this;

    };

    inputService.prototype = new base();
    inputService.prototype.constructor = inputService;


})(ngRemoteControl.EventManager.EventTarget);