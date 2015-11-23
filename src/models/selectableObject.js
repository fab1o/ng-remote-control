/**
 * Selectable Object definition
 * @author Fabio Costa
 */
ngRemoteControl.SelectableObject = (function (base) {

    ngRemoteControl.Utility.extend(SelectableObject, base);

    /**
     * @typedef {SelectableObject}
     * @constructor
     */
    function SelectableObject() {

        base.call(this);

        this.isSelected = false;
        this.isEnabled = true;
    }

    SelectableObject.prototype.onDeselected = function () {
    };

    SelectableObject.prototype.deselect = function () {

        this.isSelected = false;
        this.onDeselected();

        return true;
    };

    SelectableObject.prototype.onSelected = function () {
    };

    SelectableObject.prototype.select = function () {

        if (!this.isEnabled)
            return;

        this.isSelected = true;
        this.onSelected();

        return true;
    };

    SelectableObject.prototype.enabled = function () {

       this.isEnabled = true;
    };

    SelectableObject.prototype.disabled = function () {

        this.isEnabled = false;
    };

    return SelectableObject;

})(ngRemoteControl.FocusableObject);