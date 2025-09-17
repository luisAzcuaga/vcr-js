"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecordMode = void 0;
var RecordMode;
(function (RecordMode) {
    /**
     * Do not record any HTTP interactions; play them back.
     */
    RecordMode["none"] = "none";
    /**
     * Record the HTTP interactions if the cassette has not been recorded;
     * otherwise, playback the HTTP interactions.
     */
    RecordMode["once"] = "once";
    /**
     * Records new HTTP interactions, plays back the recorded ones, deletes the rest.
     */
    RecordMode["update"] = "update";
    /**
     * Record every HTTP interactions; do not play any back.
     */
    RecordMode["all"] = "all";
})(RecordMode = exports.RecordMode || (exports.RecordMode = {}));
//# sourceMappingURL=types.js.map