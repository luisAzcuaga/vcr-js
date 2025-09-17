"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const node_path_1 = require("node:path");
const index_1 = require("./index");
const file_storage_1 = require("./file-storage");
const promises_1 = require("node:fs/promises");
const node_fs_1 = require("node:fs");
const vitest_1 = require("vitest");
const CASSETTES_DIR = (0, node_path_1.join)(__dirname, '__cassettes__');
(0, vitest_1.describe)('cassette', () => {
    (0, vitest_1.describe)('ClientRequest', () => {
        (0, vitest_1.it)('records multiple HTTP calls', async () => {
            var vcr = new index_1.VCR(new file_storage_1.FileStorage(CASSETTES_DIR));
            vcr.requestMasker = (req) => {
                req.headers['user-agent'] = '****';
            };
            await vcr.useCassette('client_request_multiple_http_calls', async () => {
                await axios_1.default.post('https://httpbin.org/post', JSON.stringify({ name: 'alex' }), {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    }
                });
                await axios_1.default.post('https://httpbin.org/post', JSON.stringify({ name: 'yane' }), {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    }
                });
            });
        }, 5000000);
        (0, vitest_1.it)('records gzipped data as base64', async () => {
            var vcr = new index_1.VCR(new file_storage_1.FileStorage(CASSETTES_DIR));
            vcr.requestMasker = (req) => {
                req.headers['user-agent'] = '****';
            };
            await vcr.useCassette('client_request_gzipped_data_stored_as_base64', async () => {
                await axios_1.default.get('https://httpbin.org/gzip', {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    }
                });
            });
        }, 5000000);
        (0, vitest_1.it)('does not record when request is marked as pass-through', async () => {
            var vcr = new index_1.VCR(new file_storage_1.FileStorage(CASSETTES_DIR));
            vcr.requestPassThrough = (req) => {
                return req.url === 'https://httpbin.org/put';
            };
            await vcr.useCassette('client_request_pass_through_calls', async () => {
                await axios_1.default.put('https://httpbin.org/put', JSON.stringify({ name: 'alex' }), {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    }
                });
                await axios_1.default.post('https://httpbin.org/post', JSON.stringify({ name: 'john' }), {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    }
                });
            });
        }, 5000000);
        (0, vitest_1.it)('records new calls', async () => {
            const cassette = (0, node_path_1.join)(CASSETTES_DIR, 'client_request_new_calls.yaml');
            if ((0, node_fs_1.existsSync)(cassette)) {
                await (0, promises_1.unlink)(cassette);
            }
            var vcr = new index_1.VCR(new file_storage_1.FileStorage(CASSETTES_DIR));
            vcr.mode = index_1.RecordMode.once;
            await vcr.useCassette('client_request_new_calls', async () => {
                const { data: body } = await axios_1.default.post('https://httpbin.org/post', JSON.stringify({ name: 'alex' }), {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    }
                });
                (0, vitest_1.expect)(body.data).toMatchInlineSnapshot(`"{"name":"alex"}"`);
            });
            vcr.mode = index_1.RecordMode.update;
            await vcr.useCassette('client_request_new_calls', async () => {
                const { data: body } = await axios_1.default.post('https://httpbin.org/post', JSON.stringify({ name: 'alex-update' }), {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    }
                });
                (0, vitest_1.expect)(body.data).toMatchInlineSnapshot(`"{"name":"alex-update"}"`);
            });
        }, 5000000);
    });
    (0, vitest_1.describe)('fetch', () => {
        (0, vitest_1.it)('records the same HTTP call multiple times', async () => {
            var vcr = new index_1.VCR(new file_storage_1.FileStorage(CASSETTES_DIR));
            vcr.requestMasker = (req) => {
                req.headers['user-agent'] = '****';
            };
            await vcr.useCassette('fetch_same_http_call_multiple_times', async () => {
                await axios_1.default.post('https://httpbin.org/post', JSON.stringify({ name: 'alex' }), {
                    adapter: 'fetch',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    }
                });
                await axios_1.default.post('https://httpbin.org/post', JSON.stringify({ name: 'alex' }), {
                    adapter: 'fetch',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    }
                });
            });
        }, 5000000);
        (0, vitest_1.it)('records gzipped data as base64', async () => {
            var vcr = new index_1.VCR(new file_storage_1.FileStorage(CASSETTES_DIR));
            vcr.requestMasker = (req) => {
                req.headers['user-agent'] = '****';
            };
            await vcr.useCassette('fetch_gzipped_data_stored_as_base64', async () => {
                await axios_1.default.get('https://httpbin.org/gzip', {
                    adapter: 'fetch',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    }
                });
            });
        }, 5000000);
        (0, vitest_1.it)('does not record when request is marked as pass-through', async () => {
            var vcr = new index_1.VCR(new file_storage_1.FileStorage(CASSETTES_DIR));
            vcr.requestPassThrough = (req) => {
                return req.url === 'https://httpbin.org/put';
            };
            await vcr.useCassette('fetch_pass_through_calls', async () => {
                await fetch('https://httpbin.org/put', {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    },
                    method: 'PUT',
                    body: JSON.stringify({ name: 'alex' })
                });
                await axios_1.default.post('https://httpbin.org/post', {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    },
                    method: 'POST',
                    body: JSON.stringify({ name: 'alex' })
                });
            });
        }, 5000000);
        (0, vitest_1.it)('records new calls', async () => {
            const cassette = (0, node_path_1.join)(CASSETTES_DIR, 'fetch_new_calls.yaml');
            if ((0, node_fs_1.existsSync)(cassette)) {
                await (0, promises_1.unlink)(cassette);
            }
            var vcr = new index_1.VCR(new file_storage_1.FileStorage(CASSETTES_DIR));
            vcr.mode = index_1.RecordMode.once;
            await vcr.useCassette('fetch_new_calls', async () => {
                const body = await fetch('https://httpbin.org/post', {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    },
                    method: 'POST',
                    body: JSON.stringify({ name: 'alex' })
                }).then(res => res.json());
                (0, vitest_1.expect)(body.data).toMatchInlineSnapshot(`"{"name":"alex"}"`);
            });
            vcr.mode = index_1.RecordMode.update;
            await vcr.useCassette('fetch_new_calls', async () => {
                const body = await fetch('https://httpbin.org/post', {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    },
                    method: 'POST',
                    body: JSON.stringify({ name: 'alex-update' })
                }).then(res => res.json());
                (0, vitest_1.expect)(body.data).toMatchInlineSnapshot(`"{"name":"alex-update"}"`);
            });
        }, 5000000);
    });
});
//# sourceMappingURL=index.spec.js.map