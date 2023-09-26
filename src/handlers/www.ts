import { config } from "../../config";
import ejs from "ejs";
import { logHTTPRequest } from "../utils/logger";
import { generateErrorPage } from "../server";
import { getLangStrings } from "../utils/getLangStrings";
import { supportedLanguagesList } from "../consts/supportedLanguagesList";
import { getCookie } from "../utils/serverCookies";
import crypto from "crypto";
import { exec } from "child_process";

export async function handleWWW(req: Request, route: string, domainName: string): Promise<Response> {
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
                return new Response(await generateErrorPage(404, domainName), res);
            }
            logHTTPRequest(200, req);
            return new Response(await ejs.renderFile(`views/pages/index.ejs`, { domainName, userId: config.userId, lang, strings: await getLangStrings(lang, "index") }), res);
        }
        case "github-webhook": {
            const expectedSignature = req.headers.get('x-hub-signature');
            if (!expectedSignature || req.method !== "POST" || !req.body) {
                logHTTPRequest(404, req);
                res.status = 404;
                res.statusText = "Page Not Found";
                return new Response(await generateErrorPage(404, domainName), res);
            };

            console.log((await req.clone().json()));
            if ((await req.clone().json()).ref !== 'refs/heads/main') {
                return new Response("200");
            }
            const signature = `sha1=${crypto.createHmac('sha1', config.gitSecret).update(await req.text()).digest('hex')}`;

            if (crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
                exec('~/personal-website/.git/hooks/post-receive', async (error, stdout, stderr) => {
                    if (error) {
                        console.log(stderr);
                        logHTTPRequest(500, req);
                        res.status = 500;
                        res.statusText = "Error when executing the restart script";
                        return new Response(await generateErrorPage(500, domainName), res);
                    }
                });
                return new Response("200", res);
            } else {
                logHTTPRequest(418, req);
                res.status = 404184;
                res.statusText = "Crypto failed";
                return new Response(await generateErrorPage(418, domainName), res);
            }
        }
        default: {
            logHTTPRequest(404, req);
            res.status = 404;
            res.statusText = "Page Not Found";
            return new Response(await generateErrorPage(404, domainName), res);
        }
    }
}