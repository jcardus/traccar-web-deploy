export function onRequest({request, env}) {
    const url = new URL(request.url.replace('https://', 'http://'))
    url.host = env.TRACCAR_SERVER
    return fetch(new Request(url, request))
}
