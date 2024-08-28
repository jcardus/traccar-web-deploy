import {forwardWithCache, getJSessionId, invalidateSession} from "../../utils";

export async function onRequest({request, env}) {
    await invalidateSession(getJSessionId(request), env);
    return forwardWithCache({request, env});
}
