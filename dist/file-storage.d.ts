import { HttpInteraction, ICassetteStorage } from './types';
export declare class FileStorage implements ICassetteStorage {
    private readonly directory;
    constructor(directory: string);
    load(name: string): Promise<HttpInteraction[] | undefined>;
    save(name: string, interactions: HttpInteraction[]): Promise<void>;
    private replaceInvalidChars;
}
