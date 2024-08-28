import {forwardWithCache} from "../utils";
export async function onRequest({request, env, functionPath}) {
    if (request.method !== 'GET') {
        console.log(`Invalidate all due to ${request.method} ${functionPath}`);
        await invalidateAll();
    }
    return forwardWithCache({request, env});
}
