import {
    Token,
    Options
} from './types';
import {refreshToken} from './util';

export default class SynapseFetch {

    options: Options;
    token: Token | null;

    /**
     * Keeping track of an active refreshToken operation.
     *
     * This will allow us to ensure only 1 such operation happens at any
     * given time.
     */
    private activeRefresh: Promise<Token> | null;

    constructor(options: Options & Partial<Token>, token: Token | null = null) {

        if (!token) {
            throw new Error('An access token must be provided.');
        }
        this.options = options;

        this.token = token;
        this.activeRefresh = null;
    }

    /**
     * Does a fetch request and adds a Bearer / access token.
     *
     * If the access token is not known, this function attempts to fetch it
     * first. If the access token is almost expiring, this function might attempt
     * to refresh it.
     */
    async fetch(input: RequestInfo, init?: RequestInit): Promise<Response> {

        // input might be a string or a Request object, we want to make sure this
        // is always a fully-formed Request object.
        const request = new Request(input, init);

        return this.fetchMw(
            request,
            req => fetch(req)
        );

    }

    /**
     * This function allows the fetch-mw to be called as more traditional
     * middleware.
     *
     * The function takes a Request object, and a next() function that
     * represents the next 'fetch' function in the chain.
     */
    async fetchMw(request: Request, next: (request: Request) => Promise<Response>): Promise<Response> {

        const accessToken = await this.getAccessToken();

        let authenticatedRequest = request.clone();
        authenticatedRequest.headers.set('Authorization', 'Bearer ' + accessToken);
        let response = await next(authenticatedRequest);

        if (!response.ok && response.status === 401) {

            const newToken = await this.refreshToken();

            authenticatedRequest = request.clone();
            authenticatedRequest.headers.set('Authorization', 'Bearer ' + newToken.accessToken);
            response = await next(authenticatedRequest);

        }
        return response;

    }

    /**
     * Returns current token information.
     *
     * There result object will have:
     *   * accessToken
     *   * expiresAt - when the token expires, or null.
     *   * refreshToken - may be null
     */
    async getToken(): Promise<Token> {

        if (this.token && (this.token.expiresAt === null || this.token.expiresAt > Date.now())) {
            // The current token is still valid
            return this.token;
        }

        return this.refreshToken();

    }

    /**
     * Returns an access token.
     *
     * If the current access token is not known, it will attempt to fetch it.
     * If the access token is expiring, it will attempt to refresh it.
     */
    async getAccessToken(): Promise<string> {
        const token = await this.getToken();
        return token.accessToken;
    }

    /**
     * Forces an access token refresh
     */
    async refreshToken(): Promise<Token> {
        if (this.activeRefresh) {
            // If we are currently already doing this operation,
            // make sure we don't do it twice in parallel.
            return this.activeRefresh;
        }

        this.activeRefresh = refreshToken(this.options, this.token);

        try {
            const token = await this.activeRefresh;
            this.token = token;
            this.scheduleRefresh();
            return token;
        } catch (err: any) {
            if (this.options.onAuthError) {
                this.options.onAuthError(err);
            }
            throw err;
        } finally {
            // Make sure we clear the current refresh operation.
            this.activeRefresh = null;
        }
    }

}
