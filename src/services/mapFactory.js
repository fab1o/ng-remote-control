/**
 * Create maps for the handlers to navigate
 * @author Fabio Costa
 */
(function () {
    "use strict";

    var factoryId = "mapFactory";

    ngRemoteControl.factory(factoryId, mapFactory);

    function mapFactory() {

        return {
            createGridMap: createGridMap,
            createLinearMap: createLinearMap
        };

        /**
         * Creates a map of objects in linear format
         * @param {SelectableObject[]} objects
         * @param {DIRECTION} [direction="right"]
         * @param {boolean} [isCircular=false]
         * @returns {Map}
         */
        function createLinearMap(objects, direction, isCircular) {

            if (typeof objects == "undefined" || objects == null || objects.constructor !== Array) {
                return null;
            }

            isCircular = isCircular || false;
            direction = direction || DIRECTION.RIGHT;

            var map = new ngRemoteControl.DataStructures.Map();

            for (var i = 0; i < objects.length; i++) {

                switch (direction){
                    case DIRECTION.RIGHT:
                        map.pushRightFromCurrent(objects[i]);
                        break;
                    case DIRECTION.LEFT:
                        map.pushLeftFromCurrent(objects[i]);
                        break;
                    case DIRECTION.UP:
                        map.pushUpFromCurrent(objects[i]);
                        break;
                    case DIRECTION.DOWN:
                        map.pushDownFromCurrent(objects[i]);
                        break;
                }
            }

            //Making it circular if more than or equals to 2 items
            if (isCircular && objects.length >= 2 && map.current && map.head){

                switch (direction){
                    case DIRECTION.RIGHT:
                        map.current.right = map.head;
                        map.head.left = map.current;
                        break;
                    case DIRECTION.LEFT:
                        map.current.left = map.head;
                        map.head.right = map.current;
                        break;
                    case DIRECTION.UP:
                        map.current.up = map.head;
                        map.head.down = map.current;
                        break;
                    case DIRECTION.DOWN:
                        map.current.down = map.head;
                        map.head.up = map.current;
                        break;
                }
            }

            return map;
        };

        /**
         * Creates a map of objects in grid format
         * @param {SelectableObject[]} objects
         * @param {number} [rowsSize=4] max quantity of items per row
         * @returns {Map}
         */
        function createGridMap(objects, rowsSize) {

            if (typeof objects == "undefined" || objects == null || objects.constructor !== Array) {
                return null;
            }

            if (typeof rowsSize == "undefined" || rowsSize == null || Number(rowsSize) <= 0) {
                rowsSize = 4;
            }

            rowsSize = Math.ceil(rowsSize);

            var map = new ngRemoteControl.DataStructures.Map();

            var rows = [];
            var columns = [];

            var max = objects.length;

            for (var i = 1; i <= max; i++) {

                var video = objects[i - 1];
                var node = new ngRemoteControl.DataStructures.Node(video, i);

                map.nodes.push(node);

                var mod = i % rowsSize;

                if (rows.length > 0) {
                    var lastRow = rows[rows.length - 1];

                    var col = (mod || rowsSize) - 1;

                    lastRow[col].down = node;
                    node.up = lastRow[col];

                }

                if (columns.length > 0) {
                    columns[columns.length - 1].right = node;
                    node.left = columns[columns.length - 1];
                }

                columns.push(node);

                if (mod == 0 || mod == max) {
                    rows.push(columns);
                    columns = [];
                }

            }

            if (rows.length > 0 && rows[0].length > 0) {
                map.head = rows[0][0];
            }

            return map;

        };

    };

})();

var DIRECTION = (function () {

    return {
        RIGHT: "right",
        LEFT: "left",
        DOWN: "down",
        UP: "up"
    };

})();