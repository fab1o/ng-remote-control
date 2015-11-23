/**
 * Singleton utility library
 * @author Fabio Costa
 */
ngRemoteControl.Utility = new (function() {
    "use strict";

    /**
     * Extends two classes
     * @param {*} subclass
     * @param {*} superclass
     */
    function extend(subclass, superclass) {
        for (var propertyName in superclass) {
            if (superclass.hasOwnProperty(propertyName)) {
                subclass[propertyName] = superclass[propertyName];
            }
        }

        function subclassPrototype() {
            this.constructor = subclass;
        }

        subclassPrototype.prototype = superclass.prototype;
        subclass.prototype = new subclassPrototype();
    }

    //public methods
    return {
        extend: extend
    }


})();