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

export function forward ({request, env}) {
    const url = new URL(request.url.replace('https://', 'http://'))
    url.host = env.TRACCAR_SERVER
    console.log(url)
    return fetch(new Request(url, request))
}

export function getJSessionId(request) {
    return getCookie(request.headers.get('Cookie') || '', 'JSESSIONID');
}

export async function forwardWithCache({request, env}) {
    try {
        const url = new URL(request.url)
        const jSessionId = getJSessionId(request)
        if (jSessionId) { url.searchParams.set('JSESSIONID', jSessionId) }

        url.host = env.TRACCAR_SERVER
        url.protocol = 'http:'
        const cacheKey = new Request(url.toString());
        const cache = caches.default;

        let response = await cache.match(cacheKey);

        if (!response || request.method !== 'GET' || request.headers.get('Authorization') || !env.CACHE_ENABLED) {
            console.log(`cache miss: ${cacheKey.url}`,);
            response = await fetch(new Request(url, request))
            if (!response.ok) {
                console.error(response.status, await response.text())
                return new Response('Error ' + response.status, {status: response.status});
            }
            if (request.method === 'GET' && env.CACHE_KEYS && env.CACHE_ENABLED) {
                response = new Response(response.body, response);
                response.headers.append("Cache-Control", "s-maxage=31536000");
                await env.CACHE_KEYS.put(cacheKey.url, 'true');
                await cache.put(cacheKey, response.clone());
            }
        } else {
            console.log(`cache hit: ${cacheKey.url}.`);
        }
        return response
    } catch (e) {
        console.error(e)
        return new Response(e.message, {status: 500});
    }
}

export async function invalidateSession(jSessionId, env) {
    try {
        if (!env.CACHE_KEYS || !env.CACHE_ENABLED) {
            console.warn('KV namespace CACHE_KEYS is not available.');
            return;
        }

        const prefix = `http://${env.TRACCAR_SERVER}`
        let keys = await env.CACHE_KEYS.list({ prefix });

        if (keys.keys.length === 0) {
            console.log(`No cache keys found for prefix: ${prefix}`);
        }

        const cache = caches.default;

        // Invalidate each key found
        await Promise.all(keys.keys.filter(k => k.name.includes(jSessionId)).map(async key => {
            const cacheKeyUrl = key.name;
            const cacheKey = new Request(cacheKeyUrl);

            // Delete the key from the KV store
            await env.CACHE_KEYS.delete(cacheKeyUrl);
            console.log(`Cache key deleted from KV: ${cacheKeyUrl}`);

            // Delete the key from the cache
            const cacheDeleted = await cache.delete(cacheKey);
            if (cacheDeleted) {
                console.log(`Cache key deleted from cache: ${cacheKeyUrl}`);
            } else {
                console.warn(`Cache key not found in cache: ${cacheKeyUrl}`);
            }
        }))
    } catch (e) {
        console.error('Cache invalidation error:', e);
    }
}


export async function invalidatePath(pathname, env) {
    try {
        if (!env.CACHE_KEYS) {
            console.warn('KV namespace CACHE_KEYS is not available.');
            return;
        }

        const prefix = `http://${env.TRACCAR_SERVER}${pathname}`
        let keys = await env.CACHE_KEYS.list({ prefix });

        if (keys.keys.length === 0) {
            console.log(`No cache keys found for prefix: ${prefix}`);
        }

        const cache = caches.default;

        // Invalidate each key found
        await Promise.all(keys.keys.map(async key => {
            const cacheKeyUrl = key.name;
            const cacheKey = new Request(cacheKeyUrl);

            // Delete the key from the KV store
            await env.CACHE_KEYS.delete(cacheKeyUrl);
            console.log(`Cache key deleted from KV: ${cacheKeyUrl}`);

            // Delete the key from the cache
            const cacheDeleted = await cache.delete(cacheKey);
            if (cacheDeleted) {
                console.log(`Cache key deleted from cache: ${cacheKeyUrl}`);
            } else {
                console.warn(`Cache key not found in cache: ${cacheKeyUrl}`);
            }
        }))
    } catch (e) {
        console.error('Cache invalidation error:', e);
    }
}

export function getBasePath(pathname) {
    // Extract the base API path (e.g., /api/devices from /api/devices/0)
    const pathSegments = pathname.split('/');
    if (pathSegments.length > 2) {
        return `/${pathSegments[1]}/${pathSegments[2]}`;
    }
    return pathname;
}
