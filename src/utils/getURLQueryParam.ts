export function getURLQueryParam(url: string, param: string) {
    return url.split("?")[1]?.split("&").find(c => c.startsWith(`${param}=`))?.split("=")[1];
}