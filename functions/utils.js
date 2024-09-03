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

export async function forwardWithCache({request, env}, jSessionId, bypassCache) {
    try {
        const url = new URL(request.url)
        if (jSessionId) { url.searchParams.set('JSESSIONID', jSessionId) }
        const cacheKey = url.toString();
        let body = env.CACHE_KEYS && await env.CACHE_KEYS.get(cacheKey)
        if (bypassCache || !body || request.method !== 'GET' || request.headers.get('Authorization')) {
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
        if (!env.CACHE_KEYS) { return }
        if (filter) {
            await env.CACHE_KEYS.put(filter, new Date().getTime())
        }
        await env.INVALIDATE_QUEUE.send({filter, prefix});
    } catch (e) {
        console.error(e);
    }
}

export function getBaseUrl(_url, entity) {
    const url = new URL(_url)
    return `${url.origin}/api/${entity}`
}
