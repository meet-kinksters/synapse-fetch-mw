# Fetch Middleware for Matrix Synapse

This is a middleware-d `fetch` implementation to assist in utilizing
[refresh tokens](https://github.com/matrix-org/matrix-doc/pull/2918)
with the [Matrix JS SDK](https://github.com/matrix-org/matrix-js-sdk).
The SDK does not ([yet](https://github.com/matrix-org/matrix-js-sdk/issues/2141))
support this natively.

This package is heavily inspired by
[fetch-mw-oauth2](https://github.com/badgateway/fetch-mw-oauth2) and contains
some shared (MIT-licensed) code.

MIT licensed.
