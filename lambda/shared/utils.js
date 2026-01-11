export function createResponse(statusCode, body, headers = {}) {
    return {
        statusCode,
        body: JSON.stringify(body),
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,Authorization',
            'Access-Control-Allow-Methods': 'GET,POST,PUT,OPTIONS',
            ...headers,
        },
    };
}
export function getEmailFromEvent(event) {
    return event.requestContext?.authorizer?.claims?.email || null;
}
export function parseBody(body) {
    if (!body)
        return null;
    try {
        return JSON.parse(body);
    }
    catch {
        return null;
    }
}
//# sourceMappingURL=utils.js.map