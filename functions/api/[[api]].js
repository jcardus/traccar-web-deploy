import {forwardWithCache, getBasePath, invalidatePath} from "../utils";
export async function onRequest({request, env}) {
    if (request.method !== 'GET') {
        console.log(`Invalidate path due to ${request.method} ${url.pathname}`);
        await invalidatePath(getBasePath(new URL(request.url).pathname), env);
    }
    return forwardWithCache({request, env});
}
