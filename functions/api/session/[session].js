import {forward, getJSessionId, invalidateCache} from "../../utils";

export async function onRequest({request, env}) {
    await invalidateCache(env, getJSessionId(request));
    return forward({request, env});
}
