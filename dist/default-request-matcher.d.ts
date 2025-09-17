import { HttpInteraction, HttpRequest, IRequestMatcher } from './types';
export declare class DefaultRequestMatcher implements IRequestMatcher {
    compareHeaders: boolean;
    compareBody: boolean;
    readonly ignoreHeaders: Set<string>;
    indexOf(calls: HttpInteraction[], request: HttpRequest): number;
    bodiesEqual(recorded: HttpRequest, request: HttpRequest): boolean;
    headersEqual(recorded: HttpRequest, request: HttpRequest): boolean;
    urlEqual(recorded: HttpRequest, request: HttpRequest): boolean;
    methodEqual(recorded: HttpRequest, request: HttpRequest): boolean;
}
