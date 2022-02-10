/**
 * An error class for any error the server emits.
 */
export default class SynapseMwError extends Error {

    code: number;
    httpCode: number;

    constructor(message: string, code: number, httpCode: number) {
        super(message);

        this.code = code;
        this.httpCode = httpCode;
    }

}
