/**
 * Service used for for the TV API
 * @author Fabio Costa
 */
(function () {
    "use strict";

    var serviceId = "tvApiService";

    ngRemoteControl.service(serviceId, ["tvKeyConstant", "$log", tvApiService]);

    function tvApiService(tvKeyConstant, $log) {

        var plugin = null;
        var widget = null;
        var tv = null;

        var tvSef = null;

        var nnaviPlugin = null;
        var nnaviPluginSef = null;
        var networkPlugin = null;

        this.isSamsungTV = false;

        this.init = function(isSamsungTV) {

            if (typeof isSamsungTV == "undefined" || isSamsungTV == null)
                isSamsungTV = true;

            this.isSamsungTV = isSamsungTV;

            if (isSamsungTV) {

                plugin = new Common.API.Plugin();
                widget = new Common.API.Widget();
                tv = webapis.tv;

                tvSef = document.getElementById("pluginObjectTV");
                nnaviPluginSef = document.getElementById("pluginObjectNNaviSef");

                nnaviPlugin = document.getElementById("pluginObjectNNavi");
                networkPlugin = document.getElementById("pluginObjectNetwork");
            }

        };

        /**
         * Enables screen saver (when not playing video)
         * @returns {boolean}
         */
        this.enableScreenSaver = function () {

            if (!this.isSamsungTV) {
                return false;
            }

            $log.info(serviceId, "enableScreenSaver");

            if (plugin) {
                plugin.setOnScreenSaver();
                //sf.service.setScreenSaver(false);
            }

            return true;
        };

        /**
         * Disables screen saver (when playing video)
         * @returns {boolean}
         */
        this.disableScreenSaver = function () {

            if (!this.isSamsungTV) {
                return false;
            }

            $log.info(serviceId, "disableScreenSaver");

            if (plugin) {
                plugin.setOffScreenSaver();
                //sf.service.setScreenSaver(true, 100);
            }

            return true;
        };

        /**
         * Enables on-screen volume display
         * @returns {boolean}
         */
        this.enableOnScreenVolume = function () {

            if (!this.isSamsungTV) {
                return false;
            }

            $log.info(serviceId, "enableOnScreenVolume.SetBannerState");

            if (nnaviPlugin && nnaviPlugin.SetBannerState)
                nnaviPlugin.SetBannerState(1);

            if(plugin) {
                plugin.unregistKey(tvKeyConstant.VOLDOWN);
                plugin.unregistKey(tvKeyConstant.VOLUP);
                plugin.unregistKey(tvKeyConstant.MUTE);
                plugin.unregistKey(tvKeyConstant.PANELVOLDOWN);
                plugin.unregistKey(tvKeyConstant.PANELVOLUP);
            }

            return true;
        };

        /**
         * Forces app to exit via RETURN
         * @returns {boolean}
         */
        this.sendReturnEvent = function () {

            if (!this.isSamsungTV) {
                return false;
            }

            $log.info(serviceId, "sendReturnEvent");

            if (widget) {
                widget.sendReturnEvent();
            }

            return true;
        };

        /**
         * Forces app to exit via EXIT
         * @returns {boolean}
         */
        this.sendExitEvent = function () {

            if (!this.isSamsungTV) {
                return false;
            }

            $log.info(serviceId, "sendExitEvent");

            if (widget) {
                widget.sendExitEvent();
            }

            return true;
        };

        /**
         * Called from inputService.js when RETURN/EXIT is pressed
         */
        this.preventDefault = function (event) {

            if (!this.isSamsungTV) {
                return false;
            }

            $log.info(serviceId, "preventDefault");

            if (widget) {
                widget.blockNavigation(event);
            }
            event.preventDefault();

            return true;
        };

        /**
         * Registers the RETURN key so we can block it
         * @returns {boolean}
         */
        this.registerReturnKey = function () {

            if (!this.isSamsungTV) {
                return false;
            }

            $log.info(serviceId, "registerReturnKey");

            if (plugin) {
                plugin.registKey(tvKeyConstant.RETURN);
            }

            return true;
        };

        /**
         * Called when the app is ready to inform TV that is ready
         * @returns {boolean}
         */
        this.ready = function () {

            if (!this.isSamsungTV) {
                return false;
            }

            $log.info(serviceId, "ready");

            if (widget) {
                widget.sendReadyEvent();
            }

            return true;
        };

        /**
         * Returns the device id (not use if device Id is the same as device user Id, will experiment later)
         * @returns {string}
         */
        this.getDeviceId = function () {

            var id = null;

            if (tv)
                id = tv.info.getDeviceID();
            else
                id = "Web.DeviceId";

            $log.info(serviceId, "getDUID " + id);

            return id;

        };

        /**
         * Returns the TV's MAC Adress
         * @returns {string}
         */
        this.getMacAddress = function () {

            if (networkPlugin) {
                return networkPlugin.GetMAC(1);
            }else{
                return "AA:BB:CC:DD:EE:FF";
            }

        };

        /**
         * Returns the device user id
         * @returns {string}
         */
        this.getDUID = function () {

            var id = null;

            if (networkPlugin && nnaviPlugin) {

                var macAddress = networkPlugin.GetMAC(1);
                id = nnaviPlugin.GetDUID(macAddress);

            } else {

                id = "Web.DUID";
            }

            $log.info(serviceId, "getDUID " + id);

            return id;

        };

        /**
         * Determines if network is connected through Samsung Smart TV API
         * otherwise uses navigator object (for web) to determine connectivity
         * @returns {boolean}
         */
        this.isNetworkConnected = function () {

            if (networkPlugin) {

                var networkPlugin = document.getElementById("pluginObjectNetwork");

                // Get active connection type - wired or wireless.
                var currentInterface = networkPlugin.GetActiveType();

                // If no active connection.
                if (currentInterface === -1) {
                    return false;
                }

                // Check Gateway connection of current interface.
                var gatewayStatus = networkPlugin.CheckGateway(currentInterface);

                // If not connected or error.
                if (gatewayStatus !== 1) {
                    return false;
                }

                // Check HTTP transport.
                var httpStatus = networkPlugin.CheckHTTP(currentInterface);

                // If HTTP is not available.
                if (httpStatus !== 1) {
                    return false;
                }

                // Everything went OK.
                return true;

            } else {

                // Return navigator status for web
                return navigator.onLine;
            }


        };

        this.getFirmwareVersion = function() {
            if(nnaviPlugin && nnaviPlugin.GetFirmware) {
                var ret = nnaviPlugin.GetFirmware();

                if(typeof ret === "number") {
                    // Error occured
                    return "T-INFOLINK-2010-0000";
                }
                else {
                    return ret;
                }
            }
            else {
                return "T-INFOLINK-2010-0000";
            }
        };

        this.getFirmwareVersionYear = function() {

            var version = this.getFirmwareVersion();

            var year = 2014;
            if(version.indexOf("T-INFOLINK") > -1) {
                year = parseInt(version.substring(10, 14), 10);
            }

            return year;
        };

        this.isEmulator = function() {

            if(this.isSamsungTV) {

                var networkPlugin = document.getElementById("pluginObjectNetwork");
                var nnaviPlugin = document.getElementById("pluginObjectNNavi");
                if (networkPlugin && nnaviPlugin) {
                    var macAddress = networkPlugin.GetMAC(1);
                    var id = nnaviPlugin.GetDUID(macAddress);

                    if(id === "BDCAAKYFDB4FQ") {
                        return true;
                    }
                }
            }

            return false;
        };

        return this;

    };

})();