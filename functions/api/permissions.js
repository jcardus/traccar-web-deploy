import {invalidateCache, forward} from "../utils";

export async function onRequest({request, env}) {
    const json = await request.clone().json()
    for (const key of Object.keys(json).filter(k => k !== 'deviceId')) {
        await invalidateCache(env, '', `${new URL(request.url).origin}/api/${key.replace('Id', '')}`);
    }
    return forward({request, env});
}
