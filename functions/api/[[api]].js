import {forwardWithCache, invalidatePath} from "../utils";
export async function onRequest({request, env, functionPath}) {
    if (request.method !== 'GET') {
        console.log(`Invalidate path due to ${request.method} ${functionPath}`);
        await invalidatePath(request.url, env);
    }
    return forwardWithCache({request, env});
}
