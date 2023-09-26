import mime from "mime";
import { generateErrorPage } from "../server";

export async function handleCDN(_: Request, route: string, domainName: string) {
    try {
        const fileContent = await Bun.file(`public/${route}`).text();
        return new Response(fileContent, {
            headers: {
                "content-type": mime.getType(`public/${route}`)!,
                'Access-Control-Allow-Origin': "*"
            }
        });
    } catch (e) {
        return new Response(await generateErrorPage(404, domainName), {
            status: 404,
            statusText: "Page Not Found",
            headers: {
                "content-type": "text/html; charset=utf-8"
            }
        });
    }
}