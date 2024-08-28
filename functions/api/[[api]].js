export async function onRequest({request, env}) {
    try {
        const url = new URL(request.url)
        const jSessionId = getCookie(request.headers.get('Cookie'), 'JSESSIONID')
        if (jSessionId) { url.searchParams.set('JSESSIONID', jSessionId) }
        if (url.pathname === '/api/positions' && env.POSITIONS_SERVER) {
            url.hostname = env.POSITIONS_SERVER
            return Response.redirect(url, 302)
        }
        url.host = env.TRACCAR_SERVER
        url.protocol = 'http:'
        const cacheKey = new Request(url.toString());
        const cache = caches.default;

        if (request.method !== 'GET') {
            console.log(`Invalidating all cache keys for pathname due to ${request.method} request: ${url.pathname}`);
            await invalidateAllCacheKeysForPathname(getBasePath(url.pathname), env);
        }

        let response = await cache.match(cacheKey);

        if (!response || request.method !== 'GET' || request.headers.get('Authorization')) {
            console.log(`cache miss: ${cacheKey.url}`,);
            response = await fetch(new Request(url, request))
            if (!response.ok) {
                console.error(response.status, await response.text())
                return new Response('Error ' + response.status, {status: response.status});
            }
            if (request.method === 'GET' && env.CACHE_KEYS) {
                response = new Response(response.body, response);
                response.headers.append("Cache-Control", "s-maxage=31536000");
                await env.CACHE_KEYS.put(cacheKey.url, 'true'); // Store the key with any value (e.g., 'true')
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

function getCookie(cookies = '', name) {
    const cookieArr = cookies.split(';')
    for (let cookie of cookieArr) {
        const [key, value] = cookie.trim().split('=')
        if (key === name) {
            return value
        }
    }
    return null
}

async function invalidateAllCacheKeysForPathname(pathname, env) {
    try {
        if (!env.CACHE_KEYS) {
            console.warn('KV namespace CACHE_KEYS is not available.');
            return;
        }

        // List all keys in the KV store with the pathname prefix
        const listOptions = { prefix: `http://${env.TRACCAR_SERVER}/${pathname}` };
        let keys = await env.CACHE_KEYS.list(listOptions);

        if (keys.keys.length === 0) {
            console.log(`No cache keys found for pathname: ${pathname}`);
            return;
        }

        const cache = caches.default;

        // Invalidate each key found
        for (let key of keys.keys) {
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
        }
    } catch (e) {
        console.error('Cache invalidation error:', e);
    }
}

function getBasePath(pathname) {
    // Extract the base API path (e.g., /api/devices from /api/devices/0)
    const pathSegments = pathname.split('/');
    if (pathSegments.length > 2) {
        return `/${pathSegments[1]}/${pathSegments[2]}`;
    }
    return pathname;
}
