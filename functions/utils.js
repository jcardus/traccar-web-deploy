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
