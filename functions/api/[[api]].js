import {forward, forwardWithCache, getBaseUrl, getJSessionId, invalidateCache} from "../utils";
export async function onRequest({request, params, env, functionPath}) {
    const jSessionId = getJSessionId(request);
    if (request.method !== 'GET') {
        console.log(`Invalidate path due to ${request.method} ${functionPath}`);
        await env.CACHE_KEYS.put(jSessionId, new Date().getTime())
        await invalidateCache(env, getBaseUrl(request.url, params.api[0]));
        return forward({request, env})
    }
    const lastInvalid = await env.CACHE_KEYS.get(jSessionId)
    return forwardWithCache(
        {request, env},
        jSessionId,
        Date().getTime() - lastInvalid < 1000 * 60
    );
}
