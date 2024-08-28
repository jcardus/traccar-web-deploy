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
