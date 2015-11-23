/**
 * Focusable Object definition (No selection properties)
 * @author Fabio Costa
 */
ngRemoteControl.FocusableObject = (function () {
    /**
     * @typedef {FocusableObject}
     * @constructor
     */
    function FocusableObject() {
        this.isFocused = false;
    };

    FocusableObject.prototype.onFocused = function () {
    };

    FocusableObject.prototype.focus = function () {
        this.isFocused = true;
        this.onFocused();
        return true;
    };

    FocusableObject.prototype.onBlured = function () {
    };

    FocusableObject.prototype.blur = function () {
        this.isFocused = false;
        this.onBlured();
        return true;
    };

    return FocusableObject;

})();