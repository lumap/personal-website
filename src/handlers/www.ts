import { config } from "../../config";
import ejs from "ejs";
import { logHTTPRequest } from "../utils/logger";
import { generateErrorPage } from "../server";
import { getLangStrings } from "../utils/getLangStrings";
import { supportedLanguagesList } from "../consts/supportedLanguagesList";
import { getCookie } from "../utils/serverCookies";
import crypto from "crypto";
import { exec } from "child_process";
import { convertStreamToBinaryLike } from "../utils/stream2BinLike";

export async function handleWWW(req: Request, route: string): Promise<Response> {
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
                logHTTPRequest(404, req);
                res.status = 404;
                res.statusText = "Language Not Found";
                return new Response(await generateErrorPage(404), res);
            }
            logHTTPRequest(200, req);
            return new Response(await ejs.renderFile(`views/pages/index.ejs`, { userId: config.userId, lang, strings: await getLangStrings(lang, "index") }), res);
        }
        case "github-webhook": {
            const expectedSignature = req.headers.get('x-hub-signature');
            if (!expectedSignature || req.method !== "POST" || !req.body) return new Response();
            const signature = `sha1=${crypto.createHmac('sha1', config.gitSecret).update(await req.json()).digest('hex')}`;

            if (crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
                exec('~/personal-website/.git/hooks/post-receive', async (error, stdout, stderr) => {
                    if (error) {
                        logHTTPRequest(404, req);
                        res.status = 404;
                        res.statusText = "Language Not Found";
                        return new Response(await generateErrorPage(404), res);
                    }
                });
            } else {
                logHTTPRequest(404, req);
                res.status = 404;
                res.statusText = "Language Not Found";
                return new Response(await generateErrorPage(404), res);
            }
        }
        default: {
            logHTTPRequest(404, req);
            res.status = 404;
            res.statusText = "Page Not Found";
            return new Response(await generateErrorPage(404), res);
        }
    }
}