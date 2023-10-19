import mime from "mime";
import { generateErrorPage } from "../server";
import { Server } from "bun";
import { logHTTPRequest } from "../utils/logger";

export async function handleCDN(req: Request, route: string, domainName: string, server: Server) {
    try {
        const fileContent = await Bun.file(`public/${route}`).text();
        return new Response(fileContent, {
            headers: {
                "content-type": mime.getType(`public/${route}`)!,
                'Access-Control-Allow-Origin': "*"
            }
        });
    } catch (e) {
        logHTTPRequest(404, req, server);
        return new Response(await generateErrorPage(404, domainName), {
            status: 404,
            statusText: "Page Not Found",
            headers: {
                "content-type": "text/html; charset=utf-8"
            }
        });
    }
}