import {forwardWithCache, getJSessionId, invalidateSession} from "../../utils";

export async function processRequest({request, env}) {
    if (request.method !== 'GET') {
        await invalidateSession(getJSessionId(request), env);
    }
    return forwardWithCache({request, env});
}
export const onRequest = processRequest
