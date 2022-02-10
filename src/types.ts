/**
 * Token information
 */
export type Token = {
    /**
     * Access Token
     */
    accessToken: string;

    /**
     * When the Access Token expires.
     *
     * This is expressed as a unix timestamp in milliseconds.
     */
    expiresAt: number | null;

    /**
     * Refresh token
     */
    refreshToken: string;
};

export type Options = {
    /**
     * Callback to trigger when a new access/refresh token pair was obtained.
     */
    onTokenUpdate?: (token: Token) => void;

    /**
     * If authentication fails without a chance of recovery, this gets triggered.
     *
     * This is used for example when your resource server returns a 401, but only after
     * other attempts have been made to reauthenticate (such as a token refresh).
     */
    onAuthError?: (error: Error) => void;

    /**
     * Token endpoint URL.
     */
    tokenEndpoint: string;
};

export type RefreshTokenRequest = {
    refresh_token: string;
};
