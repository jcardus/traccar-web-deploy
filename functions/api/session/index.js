import {forwardWithCache, getJSessionId, invalidateSession} from "../../utils";

export async function onRequest({request, env}) {
    if (request.method !== 'GET') {
        await invalidateSession(getJSessionId(request), env);
    }
    return forwardWithCache({request, env});
}
