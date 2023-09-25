import { config } from "../../config";
import ejs from "ejs";
import { logHTTPRequest } from "../utils/logger";
import { generateErrorPage } from "../server";

export async function handleWWW(req: Request, route: string): Promise<Response> {
    let html: string;
    let res: ResponseInit = {
        headers: {
            "content-type": "text/html; charset=utf-8"
        }
    };
    switch (route) {
        case "index":
        case "catalan": {
            html = await ejs.renderFile(`views/pages/${route}.ejs`, { userId: config.userId });
            logHTTPRequest(200, req);
            break;
        }
        default: {
            html = await generateErrorPage(404);
            logHTTPRequest(404, req);
            res.status = 404;
            res.statusText = "Page Not Found";
            break;
        }
    }
    return new Response(html, res);
}