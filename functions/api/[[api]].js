import {forward, forwardWithCache, getBaseUrl, getJSessionId, invalidateCache} from "../utils";
export async function onRequest({request, params, env, functionPath}) {
    if (request.method !== 'GET') {
        console.log(`Invalidate path due to ${request.method} ${functionPath}`);
        await env.CACHE_KEYS.put(getJSessionId(request), new Date().getTime())
        await invalidateCache(env, getBaseUrl(request.url, params.api[0]));
        return forward({request, env})
    }
    const lastInvalid = await env.CACHE_KEYS.get(getJSessionId(request))
    if (new Date().getTime() - lastInvalid > 1000 * 60) {
        return forwardWithCache({request, env});
    }
    console.log(params.api[0], 'waiting 1 minute for cache invalidation')
    return forward({request, env});
}
