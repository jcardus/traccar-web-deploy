import {forward, getJSessionId, invalidateCache} from "../utils";
export async function onRequest({request, env, functionPath}) {
    if (request.method !== 'GET') {
        console.log(`session invalidate due to ${request.method} ${functionPath}`);
        await invalidateCache(env, getJSessionId(request));
    }
    return forward({request, env})
}
