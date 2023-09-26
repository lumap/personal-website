import { config } from "../../config";
import ejs from "ejs";
import { logHTTPRequest } from "../utils/logger";
import { generateErrorPage } from "../server";
import { getLangStrings } from "../utils/getLangStrings";
import { supportedLanguagesList } from "../consts/supportedLanguagesList";
import { getCookie } from "../utils/serverCookies";

export async function handleWWW(req: Request, route: string): Promise<Response> {
    let html: string;
    let res: ResponseInit = {
        headers: {
            "content-type": "text/html; charset=utf-8"
        }
    };
    switch (route) {
        case "index": {
            const cookies = req.headers.get("Cookie");
            let lang = getCookie(cookies, "language") || "en";
            if (!supportedLanguagesList.includes(lang)) {
                html = await generateErrorPage(404);
                logHTTPRequest(404, req);
                res.status = 404;
                res.statusText = "Language Not Found";
                break;
            }
            html = await ejs.renderFile(`views/pages/index.ejs`, { userId: config.userId, lang, strings: await getLangStrings(lang, "index") });
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