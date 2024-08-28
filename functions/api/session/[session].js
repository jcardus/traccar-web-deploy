import {forwardWithCache, getJSessionId, invalidateSession} from "../../utils";

export async function onRequest({request, env, params}) {
    if (request.method !== 'GET' || params.session) {
        await invalidateSession(getJSessionId(request), env);
    }
    return forwardWithCache({request, env});
}
