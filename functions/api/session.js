import {forwardWithCache, getJSessionId, invalidateSession} from "../utils";

export async function onRequest({request, env}) {
    const url = new URL(request.url);
    const pattern = new URLPattern({ pathname: '/api/session/:id' });
    const match = pattern.exec(url);
    if (match && request.method === 'GET') {
        await invalidateSession(getJSessionId(request));
    }
    return forwardWithCache({request, env});
}
