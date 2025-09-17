/// <reference types="node" />
import { ICassetteStorage, IRequestMatcher, RecordMode, HttpRequest, HttpResponse, HttpRequestMasker, PassThroughHandler } from './types';
export declare class MatchNotFoundError extends Error {
    readonly unmatchedHttpRequest: HttpRequest;
    constructor(unmatchedHttpRequest: HttpRequest);
}
export declare class Cassette {
    private readonly storage;
    private readonly matcher;
    private readonly name;
    private readonly mode;
    private readonly masker;
    private readonly passThroughHandler;
    private interceptor?;
    private list;
    private isNew;
    private inProgressCalls;
    private usedInteractions;
    private newInteractions;
    private readonly allRequests;
    private readonly playbackRequests;
    constructor(storage: ICassetteStorage, matcher: IRequestMatcher, name: string, mode: RecordMode, masker: HttpRequestMasker, passThroughHandler: PassThroughHandler | undefined);
    isDone(): boolean;
    mount(): Promise<void>;
    private recordNew;
    private recordOnce;
    private playback;
    private findMatch;
    private isPassThrough;
    eject(): Promise<void>;
}
export declare function requestToHttpRequest(request: Request, body: string): HttpRequest;
export declare function responseToHttpResponse(response: any, body: string): HttpResponse;
