import {forward} from "../utils";

export async function onRequest({ request, env }) {
    if (!env.ICONS_3D_BASE_URL) { return forward({request, env}) }
    const url = new URL(request.url);
    const rewrittenUrl = new URL(`${env.ICONS_3D_BASE_URL}/${url.pathname.replace("/icons3d/", "")}`);

    rewrittenUrl.search = url.search;

    const newRequest = new Request(rewrittenUrl, request);

    const cache = caches.default;
    let response = await cache.match(newRequest);

    if (!response) {
        console.log('cache miss', rewrittenUrl)
        response = await fetch(newRequest);
        const headers = new Headers(response.headers);
        headers.set('Cache-Control', 'max-age=31536000, public, immutable');

        response = new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers,
        });
        await cache.put(newRequest, response.clone());
    } else {
        console.log('cache hit', rewrittenUrl)
    }

    return response

}
