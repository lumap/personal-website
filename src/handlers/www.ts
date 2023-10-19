import { config } from "../../config";
import ejs from "ejs";
import { logHTTPRequest } from "../utils/logger";
import { generateErrorPage } from "../server";
import { getLangStrings } from "../utils/getLangStrings";
import { supportedLanguagesList } from "../consts/supportedLanguagesList";
import { getCookie } from "../utils/serverCookies";
import { Server } from "bun";

export async function handleWWW(req: Request, route: string, domainName: string, server: Server): Promise<Response> {
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
                logHTTPRequest(404, req, server);
                res.status = 404;
                res.statusText = "Language Not Found";
                return new Response(await generateErrorPage(404, domainName), res);
            }
            logHTTPRequest(200, req, server);
            return new Response(await ejs.renderFile(`views/pages/index.ejs`, { s: domainName.startsWith('localhost') ? '' : 's', domainName, userId: config.userId, lang, strings: await getLangStrings(lang, "index") }), res);
        }
        default: {
            logHTTPRequest(404, req, server);
            res.status = 404;
            res.statusText = "Page Not Found";
            return new Response(await generateErrorPage(404, domainName), res);
        }
    }
}