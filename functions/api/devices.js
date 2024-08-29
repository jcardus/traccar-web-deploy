import {forward} from '../utils'
export async function onRequest({request, env}) {
    return forward({request, env}, request.method === 'GET' && {
        // cache gets or 10 seconds
        cacheTtl: 10,
        cacheEverything: true,
    })
}
