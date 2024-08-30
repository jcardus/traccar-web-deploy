export function getCookie(cookies = '', name) {
    const cookieArr = cookies.split(';')
    for (let cookie of cookieArr) {
        const [key, value] = cookie.trim().split('=')
        if (key === name) {
            return value
        }
    }
    return null
}

export function forward ({request, env}, cf) {
    const url = new URL(request.url)
    url.host = env.TRACCAR_SERVER
    url.protocol = 'http:'
    url.port = 80
    return fetch(new Request(url, request), cf)
}

export function getJSessionId(request) {
    return getCookie(request.headers.get('Cookie') || '', 'JSESSIONID');
}

export async function forwardWithCache({request, env}) {
    try {
        const url = new URL(request.url)
        const jSessionId = getJSessionId(request)
        if (jSessionId) { url.searchParams.set('JSESSIONID', jSessionId) }
        const cacheKey = url.toString();
        let body = env.CACHE_KEYS && await env.CACHE_KEYS.get(cacheKey)
        if (!body || request.method !== 'GET' || request.headers.get('Authorization')) {
            console.log(`cache miss: ${cacheKey}`);
            const response = await forward({request, env})
            if (!response.ok) {
                console.error(response.status, await response.text())
                return new Response('Error ' + response.status, {status: response.status});
            }
            body = await response.text()
            if (request.method === 'GET' && env.CACHE_KEYS) {
                await env.CACHE_KEYS.put(cacheKey, body);
            }
        } else {
            console.log(`cache hit: ${cacheKey}.`);
        }
        return new Response(body)
    } catch (e) {
        console.error(e)
        return new Response(e.message, {status: 500});
    }
}

export async function invalidateCache(env, filter= '', prefix= '') {
    try {
        if (!env.CACHE_KEYS) {
            console.warn('KV namespace CACHE_KEYS is not available.');
            return;
        }

        try {
            await env.INVALIDATE_QUEUE.send({filter, prefix});
        } catch (e) {
            console.error(e);
        }

        let keys = await env.CACHE_KEYS.list({ prefix });
        if (keys.keys.length === 0) { console.log(`No cache found for prefix: ${prefix} and filter: ${filter}`) }
        await Promise.all(keys.keys.filter(k => !filter || k.name.includes(filter)).map(async k => {
            await env.CACHE_KEYS.delete(k.name);
            console.log(`Cache key deleted from KV: ${k.name}`);
        }))
    } catch (e) {
        console.error('Cache delete error:', e);
    }
}

export function getBaseUrl(_url) {
    const url = new URL(_url)
    const pathSegments = url.pathname.split('/');
    return url.origin + (pathSegments.length > 2 ? `/${pathSegments[1]}/${pathSegments[2]}` : '');
}
