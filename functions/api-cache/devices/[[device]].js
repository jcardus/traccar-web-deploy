import {forward} from '../../utils'
export async function onRequest({request, env, functionPath}) {
    try {
        console.log('devices', functionPath)
        return forward({request, env}, request.method === 'GET' ? {
            cf: {
                cacheTtl: 5,
                cacheEverything: true,
            }
        } : undefined)
    } catch (e) {
        console.error(e)
        return new Response(e.message, {status: 500})
    }
}
