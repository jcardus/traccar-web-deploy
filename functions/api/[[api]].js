export async function onRequest({request, env}) {
    try {
        const url = new URL(request.url)
        const cookie = request.headers.get('Cookie') || '';

        if (url.pathname === '/api/positions' && env.POSITIONS_SERVER) {
            const jSessionId = getCookie(cookie, 'JSESSIONID')
            if (jSessionId) {
                url.searchParams.set('JSESSIONID', jSessionId)
            }
            url.hostname = env.POSITIONS_SERVER
            return Response.redirect(url, 302)
        }

        const auth = request.headers.get('Authorization') || '';
        const cacheKey = new Request(
            `${url.toString()}${url.search ? '&' : '?'}cookie=${encodeURIComponent(cookie)}&auth=${encodeURIComponent(auth)}`
        );
        const cache = caches.default;
        let response = await cache.match(cacheKey);

        if (!response || request.method !== 'GET') {
            console.log(`${cacheKey.url} not present in cache. Fetching and caching request.`,);
            url.host = env.TRACCAR_SERVER
            url.protocol = 'http:'
            response = await fetch(new Request(url, request))
            if (!response.ok) {
                console.error(response.status, await response.text())
                return new Response('Error ' + response.status, {status: response.status});
            }
            if (request.method === 'GET') {
                response = new Response(response.body, response);
                response.headers.append("Cache-Control", "s-maxage=10");
                await cache.put(cacheKey, response.clone());
            }
        } else {
            console.log(`Cache hit for: ${cacheKey.url}.`);
        }
        return response
    } catch (e) {
        console.error(e)
        return new Response(e.message, {status: 500});
    }
}

function getCookie(cookies, name) {
    const cookieArr = cookies.split(';')
    for (let cookie of cookieArr) {
        const [key, value] = cookie.trim().split('=')
        if (key === name) {
            return value
        }
    }
    return null
}
