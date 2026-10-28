// Base URL of the ShopMate API.
// Uses the same hostname the page was opened with (localhost or 127.0.0.1), so the
// auth cookie set by the API is treated as same-site and gets sent on every request.
const SERVER_PORT = 5113;
const SERVER_ENDPOINT = `${window.location.protocol}//${window.location.hostname}:${SERVER_PORT}`;
