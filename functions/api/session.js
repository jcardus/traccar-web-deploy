import {forwardWithCache, getJSessionId, invalidateSession} from "../utils";

export async function onRequest({request, env}) {
    const match = new URLPattern({ pathname: '/api/session/:id' }).exec(request.url);
    if (request.method !== 'GET' || match) {
        await invalidateSession(getJSessionId(request), env);
    }
    return forwardWithCache({request, env});
}
