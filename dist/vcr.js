"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VCR = void 0;
const promises_1 = require("node:timers/promises");
const types_1 = require("./types");
const default_request_matcher_1 = require("./default-request-matcher");
const cassette_1 = require("./cassette");
const ENV_TO_RECORD_MODE = {
    [types_1.RecordMode.none]: types_1.RecordMode.none,
    [types_1.RecordMode.once]: types_1.RecordMode.once,
    [types_1.RecordMode.all]: types_1.RecordMode.all,
    [types_1.RecordMode.update]: types_1.RecordMode.update,
};
class VCR {
    constructor(storage) {
        this.storage = storage;
        this.matcher = new default_request_matcher_1.DefaultRequestMatcher();
        this.requestMasker = () => { };
        this.mode = types_1.RecordMode.once;
    }
    async useCassette(name, action) {
        const mode = ENV_TO_RECORD_MODE[process.env.VCR_MODE ?? this.mode] ?? this.mode;
        var cassette = new cassette_1.Cassette(this.storage, this.matcher, name, mode, this.requestMasker, this.requestPassThrough);
        await cassette.mount();
        try {
            await action();
            let waited = 0;
            while (!cassette.isDone() && waited < 10000) {
                waited += 50;
                await (0, promises_1.setTimeout)(50);
            }
        }
        finally {
            await cassette.eject();
        }
    }
}
exports.VCR = VCR;
//# sourceMappingURL=vcr.js.map