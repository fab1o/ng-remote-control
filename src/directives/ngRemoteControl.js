/**
 * the html A tag responsible for capturing the inputs on ng-keydown
 * @author Fabio Costa
 */
(function () {
    "use strict";

    ngRemoteControl.directive("ngRemoteControl", ["inputService", function (inputService) {

        return {
            template: "<a href='javascript:void(0);' id='input-key-anchor' ng-keydown='onKeyDown($event)' />",
            restrict: "E",
            replace:  true,
            link: function (scope, elem) {

                scope.onKeyDown = function (event) {

                    inputService.onKeyDown(event);
                };

                elem[0].focus();

            }
        }
    }]);

})();