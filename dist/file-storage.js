"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileStorage = void 0;
const promises_1 = require("node:fs/promises");
const node_path_1 = require("node:path");
const yaml_1 = require("yaml");
const INVALID_FILENAME_CHARS = new Set(['/', '\\', '?', '%', '*', ':', '|', '"', '<', '>', '.', ',', ';', '=', ' ']);
class FileStorage {
    constructor(directory) {
        this.directory = directory;
    }
    async load(name) {
        try {
            var validName = this.replaceInvalidChars(name);
            var data = await (0, promises_1.readFile)((0, node_path_1.join)(this.directory, validName) + ".yaml", 'utf8');
            return (0, yaml_1.parse)(data);
        }
        catch (err) {
            if (err.code === 'ENOENT') {
                return undefined;
            }
            throw err;
        }
    }
    async save(name, interactions) {
        const validName = this.replaceInvalidChars(name);
        await (0, promises_1.access)(this.directory, promises_1.constants.F_OK).catch(async () => {
            await (0, promises_1.mkdir)(this.directory, { recursive: true });
        });
        return (0, promises_1.writeFile)((0, node_path_1.join)(this.directory, validName) + ".yaml", (0, yaml_1.stringify)(interactions), 'utf8');
    }
    replaceInvalidChars(name) {
        const newName = [];
        for (const ch of name) {
            newName.push(INVALID_FILENAME_CHARS.has(ch) ? "_" : ch);
        }
        return newName.join('');
    }
}
exports.FileStorage = FileStorage;
//# sourceMappingURL=file-storage.js.map