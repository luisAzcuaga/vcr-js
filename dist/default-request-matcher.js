"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultRequestMatcher = void 0;
class DefaultRequestMatcher {
    constructor() {
        this.compareHeaders = true;
        this.compareBody = true;
        this.ignoreHeaders = new Set();
    }
    indexOf(calls, request) {
        for (let i = 0; i < calls.length; i++) {
            const call = calls[i];
            if (!this.urlEqual(call.request, request))
                continue;
            if (!this.methodEqual(call.request, request))
                continue;
            if (this.compareHeaders && !this.headersEqual(call.request, request))
                continue;
            if (this.compareBody && !this.bodiesEqual(call.request, request))
                continue;
            return i;
        }
        return -1;
    }
    bodiesEqual(recorded, request) {
        return recorded.body == request.body;
    }
    headersEqual(recorded, request) {
        // Compare recorded headers against request headers
        for (const recordedHeader in recorded.headers) {
            if (this.ignoreHeaders.has(recordedHeader))
                continue;
            if (!request.headers[recordedHeader])
                return false;
            if (recorded.headers[recordedHeader] !== request.headers[recordedHeader])
                return false;
        }
        // Check for headers not present in recorded request
        for (const header in request.headers) {
            if (this.ignoreHeaders.has(header))
                continue;
            if (!recorded.headers[header])
                return false;
        }
        return true;
    }
    urlEqual(recorded, request) {
        return recorded.url === request.url;
    }
    methodEqual(recorded, request) {
        return recorded.method === request.method;
    }
}
exports.DefaultRequestMatcher = DefaultRequestMatcher;
//# sourceMappingURL=default-request-matcher.js.map