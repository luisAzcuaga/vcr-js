"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.responseToHttpResponse = exports.requestToHttpRequest = exports.Cassette = exports.MatchNotFoundError = void 0;
const fetch_1 = require("@mswjs/interceptors/fetch");
const ClientRequest_1 = require("@mswjs/interceptors/ClientRequest");
const interceptors_1 = require("@mswjs/interceptors");
const types_1 = require("./types");
const node_stream_1 = require("node:stream");
const node_assert_1 = __importDefault(require("node:assert"));
class MatchNotFoundError extends Error {
    constructor(unmatchedHttpRequest) {
        super(`Match no found for ${unmatchedHttpRequest.method} ${unmatchedHttpRequest.url}`);
        this.unmatchedHttpRequest = unmatchedHttpRequest;
    }
}
exports.MatchNotFoundError = MatchNotFoundError;
class Cassette {
    constructor(storage, matcher, name, mode, masker, passThroughHandler) {
        this.storage = storage;
        this.matcher = matcher;
        this.name = name;
        this.mode = mode;
        this.masker = masker;
        this.passThroughHandler = passThroughHandler;
        this.list = [];
        this.isNew = false;
        this.inProgressCalls = 0;
        this.usedInteractions = new Set();
        this.newInteractions = new Set();
        this.allRequests = new Map();
        this.playbackRequests = new Set();
    }
    isDone() {
        return this.inProgressCalls === 0;
    }
    async mount() {
        const list = await this.storage.load(this.name);
        this.isNew = !list;
        this.list = list ?? [];
        this.interceptor = new interceptors_1.BatchInterceptor({
            name: 'my-interceptor',
            interceptors: [
                new ClientRequest_1.ClientRequestInterceptor(),
                new fetch_1.FetchInterceptor(),
            ],
        });
        // Enable the interception of requests.
        this.interceptor.apply();
        this.interceptor.on('request', async ({ request, requestId }) => {
            this.allRequests.set(requestId, request.clone());
            // Handle CONNECT requests for proxy tunneling - always pass through
            if (request.method === 'CONNECT') {
                // Let the request pass through without VCR interference
                return;
            }
            // Also detect proxy requests by looking for proxy-related headers
            const hasProxyAuth = request.headers.has('proxy-authorization');
            const hasProxyConnection = request.headers.has('proxy-connection');
            if (hasProxyAuth || hasProxyConnection) {
                return;
            }
            const isPassThrough = await this.isPassThrough(request);
            if (isPassThrough) {
                return;
            }
            if (this.mode === types_1.RecordMode.none) {
                return this.playback(request, requestId);
            }
            if (this.mode === types_1.RecordMode.once) {
                return this.recordOnce(request, requestId);
            }
            if (this.mode === types_1.RecordMode.update) {
                return this.recordNew(request, requestId);
            }
        });
        this.interceptor.on('response', async ({ response, requestId }) => {
            const req = this.allRequests.get(requestId);
            node_assert_1.default.ok(req, `Request with id ${requestId} not found in allRequests map`);
            // Check if this was a playback request - if so, don't record the response
            if (this.playbackRequests.has(requestId)) {
                this.playbackRequests.delete(requestId);
                return;
            }
            const isPassThrough = await this.isPassThrough(req);
            if (isPassThrough) {
                return;
            }
            const res = response.clone();
            const httpRequest = requestToHttpRequest(req, await consumeBody(req));
            const httpResponse = responseToHttpResponse(res, await consumeBody(res));
            this.masker(httpRequest);
            const newInteraction = {
                request: httpRequest,
                response: httpResponse,
            };
            this.list.push(newInteraction);
            this.newInteractions.add(newInteraction);
            this.inProgressCalls = Math.max(0, this.inProgressCalls - 1);
        });
    }
    async recordNew(request, requestId) {
        try {
            return await this.playback(request, requestId);
        }
        catch (error) {
            if (error instanceof MatchNotFoundError) {
                this.inProgressCalls++;
                return;
            }
            throw error;
        }
    }
    async recordOnce(request, requestId) {
        if (this.isNew) {
            this.inProgressCalls++;
            return;
        }
        return this.playback(request, requestId);
    }
    async playback(request, requestId) {
        this.playbackRequests.add(requestId);
        const req = request.clone();
        const httpRequest = requestToHttpRequest(req, await consumeBody(req));
        this.masker?.(httpRequest);
        const match = this.findMatch(httpRequest);
        if (!match) {
            throw new MatchNotFoundError(httpRequest);
        }
        this.usedInteractions.add(match);
        let body = match.response.body;
        if (isGzippedMatch(match.response.headers)) {
            const readable = new node_stream_1.Readable();
            readable._read = () => { };
            readable.push(Buffer.from(match.response.body, 'base64'));
            readable.push(null);
            body = readable;
        }
        request.respondWith(new Response(body, {
            status: match.response.status,
            statusText: match.response.statusText,
            headers: match.response.headers,
        }));
    }
    findMatch(httpRequest) {
        const index = this.matcher.indexOf(this.list, httpRequest);
        if (index >= 0) {
            const [match] = this.list.splice(index, 1);
            return match;
        }
        return undefined;
    }
    async isPassThrough(request) {
        if (this.passThroughHandler) {
            const req = request.clone();
            const httpRequest = requestToHttpRequest(req, await consumeBody(req));
            return this.passThroughHandler(httpRequest);
        }
        return false;
    }
    async eject() {
        this.interceptor?.dispose();
        if (this.mode === types_1.RecordMode.none) {
            return;
        }
        if (this.mode === types_1.RecordMode.once && !this.isNew) {
            return;
        }
        if (this.mode === types_1.RecordMode.update && !this.isNew) {
            // delete unsued interactions
            this.list = this.list.filter((interaction) => this.newInteractions.has(interaction) || this.usedInteractions.has(interaction));
        }
        await this.storage.save(this.name, this.list);
    }
}
exports.Cassette = Cassette;
function requestToHttpRequest(request, body) {
    var headers = {};
    for (const [key, value] of request.headers) {
        headers[key] = value;
    }
    return {
        url: request.url,
        method: request.method,
        headers,
        body,
    };
}
exports.requestToHttpRequest = requestToHttpRequest;
function responseToHttpResponse(response, body) {
    var headers = {};
    for (const [key, value] of response.headers) {
        headers[key] = value;
    }
    return {
        status: response.status,
        statusText: response.statusText,
        headers,
        body,
    };
}
exports.responseToHttpResponse = responseToHttpResponse;
async function consumeBody(req) {
    return isGzipped(req.headers) ? Buffer.from(await req.arrayBuffer()).toString('base64') : await req.text();
}
function isGzippedMatch(headers) {
    const header = headers['content-encoding'];
    return !!header && header.indexOf('gzip') >= 0;
}
function isGzipped(headers) {
    const header = headers.get('content-encoding');
    return !!header && header.indexOf('gzip') >= 0;
}
//# sourceMappingURL=cassette.js.map