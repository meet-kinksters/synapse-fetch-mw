import {
    RefreshTokenRequest,
    Token,
    Options,
} from './types';
import SynapseMwError from "./error";

/**
 * This function either obtains a new access token, or refreshes an old
 * one.
 */
export async function refreshToken(options: Options, token: Token): Promise<Token> {
    // The request body for the refresh endpoint
    let body: RefreshTokenRequest;

    body = {
        refresh_token: token.refreshToken,
    };

    const headers: {[s: string]: string} = {
        'content-type' : 'application/json',
    };

    const authResult = await fetch(options.tokenEndpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
    });

    const jsonResult = await authResult.json();

    if (!authResult.ok) {
        const httpError = authResult.status;
        let errorMessage;

        let code;
        if (jsonResult.error) {
            errorMessage = 'Refresh error ' + jsonResult.error + '.';
            if (jsonResult.error_description) {
                errorMessage += ' ' + jsonResult.error_description;
            }
            code = jsonResult.error;
        } else {
            errorMessage = 'HTTP Error ' + authResult.status + ' ' + authResult.statusText;
            code = null;
        }
        throw new SynapseMwError(errorMessage, code, httpError);
    }


    const newToken: Token = {
        accessToken: jsonResult.access_token,
        expiresAt: jsonResult.expires_in_ms ? Date.now() + (jsonResult.expires_in_ms * 1000) : null,
        refreshToken: jsonResult.refresh_token ? jsonResult.refresh_token : null,
    };
    if (options.onTokenUpdate) {
        options.onTokenUpdate(newToken);
    }

    return newToken;
}
