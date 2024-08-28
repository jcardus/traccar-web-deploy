import {forward, getCookie} from "../utils";

export async function onRequest({request, env}) {
    if (env.POSITIONS_SERVER) {
        const jSessionId = getCookie(request.headers.get('Cookie'), 'JSESSIONID')
        if (jSessionId) { url.searchParams.set('JSESSIONID', jSessionId) }
        url.hostname = env.POSITIONS_SERVER
        return Response.redirect(url, 302)
    }
    return forward({request, env})
}
