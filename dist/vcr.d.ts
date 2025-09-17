import { HttpRequestMasker, ICassetteStorage, IRequestMatcher, PassThroughHandler, RecordMode } from './types';
export declare class VCR {
    private readonly storage;
    matcher: IRequestMatcher;
    requestMasker: HttpRequestMasker;
    requestPassThrough?: PassThroughHandler;
    mode: RecordMode;
    constructor(storage: ICassetteStorage);
    useCassette(name: string, action: () => Promise<void>): Promise<void>;
}
