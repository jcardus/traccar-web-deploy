import {forward} from '../../utils'
export async function onRequest({request, env, functionPath}) {
    console.log('devices', functionPath)
    return forward({request, env}, request.method === 'GET' && {
        cf: {
            cacheTtl: 10,
            cacheEverything: true,
        }
    })
}
