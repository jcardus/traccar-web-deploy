import {invalidateCache, getJSessionId, forward} from "../utils";

export async function onRequest({request, env}) {
    await invalidateCache(env, getJSessionId(request));
    return forward({request, env});
}
