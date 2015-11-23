/**
 * Service used to manager swiching focus between handlers and maintaining current focused handler
 */
(function () {
    "use strict";

    var serviceId = "handlerService";

    ngRemoteControl.service(serviceId, ["$log", "handlerFactory", handlerService]);

    /**
     * @typedef {handlerService}
     */
    function handlerService($log, handlerFactory) {

        /**
         * App handler - used in the entire app to listen for global rc buttons like the Exit button
         * @type {RemoteControlHandler}
         */
        this.appHandler = null;

        /**
         * Menu handler - used in the top main menu
         * @type {RemoteControlHandler}
         */
        this.menuHandler = null;

        /**
         * Content handler - used in the content section
         * @type {RemoteControlHandler}
         */
        this.contentHandler = null;

        /**
         * Settings handler - used in the settings menu
         * @type {RemoteControlHandler}
         */
        this.subMenuHandler = null;

        /**
         * Scrolling handler - used in the settings scrolling
         * @type {RemoteControlHandler}
         */
        this.scrollingHandler = null;

        /**
         * current focused handler
         * @type {RemoteControlHandler}
         */
        this.currentFocused = null;

        /**
         * Used in the movies filter
         * @type {RemoteControlHandler}
         */
        this.filterHandler = null;

        /**
         * Multiple Carousels handler - used in the featured section
         * @type {RemoteControlHandler}
         */
        this.carouselsHandler = [];

        /**
         * Seasons Menu handler - used in the originals detail seasons menu
         * @type {RemoteControlHandler}
         */
        this.seasonsMenuHandler = null;

        /**
         * Creates a new handler
         * @param {{name: string, isFocused: boolean}|{name: string, [isFocused]: boolean, [debug]: boolean, [autoSelect]: boolean }} [options]
         */
        this.createHandler = function (options){

            return new handlerFactory.RemoteControlHandler(options);
        };

        /**
         * Switches focus from currentFocused handler to new handler and maintain it as currentFocused
         * @param {*|handlerFactory.RemoteControlHandler|RemoteControlHandler} handler
         * @param {{
         * [select]: boolean
         * [skipBlurCurrent]: boolean
         * }} [options]
         * @returns {boolean}
         */
        this.focus = function (handler, options) {

            if (handler == null) {
                $log.error(serviceId, "argument 'handler' cannot be null");
                return false;
            }

            options = options || {
                select: false,
                skipBlurCurrent: false
            };

            options.select = options.select || false;
            options.skipBlurCurrent = options.skipBlurCurrent || false;

            if (this.currentFocused) {

                this.currentFocused.blur({
                    blurCurrentFocused: this.currentFocused.name != handler.name
                });

                $log.warn(serviceId, "transitioning from " + this.currentFocused.name + " to " + handler.name);
            }

            this.currentFocused = handler;
            this.currentFocused.focus(options);

            if (options.select)
                this.currentFocused.select();

            return true;
        };

        var focuses = {}; //auxiliary to save the current handler that needs to be focused later

        this.currentState = function(){

            var currentFocusState = {};


            if (this.currentFocused) {
                currentFocusState.currentFocusedIsFocused = this.currentFocused.isFocused;
            }

            if (this.contentHandler) {
                currentFocusState.contentHandlerIsFocused = this.contentHandler.isFocused;
            }

            if (this.carouselsHandler && this.carouselsHandler.isFocused) {
                currentFocusState.carouselsHandlerIsFocused = this.carouselsHandler.isFocused;
            }

            if (this.subMenuHandler) {
                currentFocusState.subMenuHandlerIsFocused = this.subMenuHandler.isFocused;
            }

            if (this.seasonsMenuHandler) {
                currentFocusState.seasonsMenuHandlerIsFocused = this.seasonsMenuHandler.isFocused;
            }

            if (this.filterHandler) {
                currentFocusState.filterHandlerIsFocused = this.filterHandler.isFocused;
            }

            if (this.menuHandler) {
                currentFocusState.menuHandlerIsFocused = this.menuHandler.isFocused;
            }

            if (this.appHandler) {
                currentFocusState.appHandlerIsFocused = this.appHandler.isFocused;
            }

            return currentFocusState;

        }


        /**
         * Blur all handlers
         * @param {boolean} skipAppHandler
         * @returns {boolean}
         */
        this.blurAll = function (skipAppHandler) {

            $log.info(serviceId, "blurAll");

            if (this.currentFocused) {
                focuses.currentFocusedIsFocused = this.currentFocused.isFocused;
                this.currentFocused.blur({
                    cancelTimer: this.menuHandler !== this.currentFocused && this.subMenuHandler !== this.currentFocused
                });
            }

            if (this.contentHandler) {
                focuses.contentHandlerIsFocused = this.contentHandler.isFocused;
                this.contentHandler.blur();
            }

            if (this.carouselsHandler && this.carouselsHandler.isFocused) {
                focuses.carouselsHandlerIsFocused = this.carouselsHandler.isFocused;
                this.carouselsHandler.blur();
            }

            if (this.subMenuHandler) {
                focuses.subMenuHandlerIsFocused = this.subMenuHandler.isFocused;
                this.subMenuHandler.blur({
                    cancelTimer: false
                });
            }

            if (this.seasonsMenuHandler) {
                focuses.seasonsMenuHandlerIsFocused = this.seasonsMenuHandler.isFocused;
                this.seasonsMenuHandler.blur({
                    cancelTimer: false
                });
            }

            if (this.filterHandler) {
                focuses.filterHandlerIsFocused = this.filterHandler.isFocused;
                this.filterHandler.blur();
            }

            if (this.menuHandler) {
                focuses.menuHandlerIsFocused = this.menuHandler.isFocused;
                this.menuHandler.blur({
                    cancelTimer: false
                });
            }

            if (skipAppHandler)
                return true;

            if (this.appHandler) {
                focuses.appHandlerIsFocused = this.appHandler.isFocused;
                this.appHandler.blur();
            }

            return true;
        };


        this.restoreState = function(savedState) {

            if (savedState.appHandlerIsFocused && this.appHandler) {
                this.appHandler.focus();
            }

            if (savedState.menuHandlerIsFocused && this.menuHandler) {
                this.menuHandler.focus({
                    focusCurrentSelected: true
                });
            }

            if (savedState.contentHandlerIsFocused && this.contentHandler) {
                this.contentHandler.focus();
            }

            if (savedState.carouselsHandlerIsFocused && this.carouselsHandler) {
                this.carouselsHandler.focus();
            }

            if (savedState.subMenuHandlerIsFocused && this.subMenuHandler) {
                this.subMenuHandler.focus({
                    focusCurrentSelected: true
                });
            }

            if (savedState.seasonsMenuHandlerIsFocused && this.seasonsMenuHandler) {
                this.seasonsMenuHandler.focus({
                    focusCurrentSelected: true
                });
            }

            if (savedState.filterHandlerIsFocused && this.filterHandler) {
                this.filterHandler.focus();
            }

            if (savedState.currentFocusedIsFocused && this.currentFocused) {
                this.currentFocused.focus();
            }


        };

        /**
         * Undo blur on all handlers
         * @returns {boolean}
         */
        this.undoBlur = function () {

            $log.info(serviceId, "undoBlur");

            var none = true;

            if (focuses.appHandlerIsFocused && this.appHandler) {
                this.appHandler.focus();
            }

            if (focuses.menuHandlerIsFocused && this.menuHandler) {
                this.menuHandler.focus({
                    focusCurrentSelected: true
                });
                none = false;
            }

            if (focuses.contentHandlerIsFocused && this.contentHandler) {
                this.contentHandler.focus();
                none = false;
            }

            if (focuses.carouselsHandlerIsFocused && this.carouselsHandler) {
                this.carouselsHandler.focus();
                none = false;
            }

            if (focuses.subMenuHandlerIsFocused && this.subMenuHandler) {
                this.subMenuHandler.focus({
                    focusCurrentSelected: true
                });
                none = false;
            }

            if (focuses.seasonsMenuHandlerIsFocused && this.seasonsMenuHandler) {
                this.seasonsMenuHandler.focus({
                    focusCurrentSelected: true
                });
                none = false;
            }

            if (focuses.filterHandlerIsFocused && this.filterHandler) {
                this.filterHandler.focus();
                none = false;
            }

            if (focuses.currentFocusedIsFocused && this.currentFocused) {
                this.currentFocused.focus();
                none = false;
            }

            if (none) { //this happens when an overlay was replaced by another overlay (usually the exit overlay, when blurAll was called and skipAppHandler is true)

                if (this.contentHandler)
                    this.contentHandler.focus();

                else if (this.subMenuHandler)
                    this.subMenuHandler.focus();

                else if (this.seasonsMenuHandler)
                    this.seasonsMenuHandler.focus();

                else if (this.menuHandler)
                    this.menuHandler.focus();
            }

            focuses = {};

            return true;
        };

        return this;

    }

    handlerService.prototype = {

        get currentFocusedHandler(){
            return this.currentFocused;
        }

    };

})();