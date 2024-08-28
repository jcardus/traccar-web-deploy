import {forwardWithCache, getBaseUrl, invalidateCache} from "../utils";
export async function onRequest({request, env, functionPath}) {
    if (request.method !== 'GET') {
        console.log(`Invalidate path due to ${request.method} ${functionPath}`);
        await invalidateCache(env, '', getBaseUrl(request.url));
    }
    return forwardWithCache({request, env});
}
