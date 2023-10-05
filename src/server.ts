import ejs from "ejs";
import mime from "mime";
import {logMessage,logRedirect} from "./utils/logger";
import {handleAPI} from "./handlers/api";
import {handleCDN} from "./handlers/cdn";
import {handleWWW} from "./handlers/www";
import {config} from "../config";

export async function generateErrorPage (statusCode: number,domainName: string): Promise<string> {
    return await ejs.renderFile("views/pages/error.ejs",{s: domainName.startsWith('localhost')? '':'s',domainName,err: statusCode});
}

const regex=new RegExp(`https{0,1}:\/\/([a-z]{0,255})?\.?(${config.domain}|localhost:${config.port})\/?(.{0,10000})?`);

async function handleReq (req: Request) {
    const match=req.url.match(regex);
    // match[0] = req.url
    // match[1] = subdomain or undefined
    // match[2] = domain or "localhost:port"
    // match[3] = which page is being accessed or ''
    if(!match) return new Response(await generateErrorPage(418,"lumap.cat"),{
        status: 418,
        statusText: "Stop Being Silly",
        headers: {
            "content-type": "text/html; charset=utf-8"
        }
    });
    const pathAccessed=match[3]?.split("?")[0]||"index";
    if(["favicon.ico","robots.txt"].includes(pathAccessed)) {
        const fileContent=await Bun.file(`public/${pathAccessed}`).text();
        return new Response(fileContent,{
            headers: {
                "content-type": mime.getType(`public/${pathAccessed}`)!
            }
        });
    }
    switch(match[1]||"www") {
    case "p": {
        const redirectTo="https://girakacheezer.tumblr.com/post/177279041551/niko-hld-crossover-cosplay-commission-for-a-very";
        logRedirect(redirectTo,req);
        return Response.redirect(redirectTo,302);
    }
    case "d": {
        const redirectTo="https://discord.gg/h4UaJ5JNpj";
        logRedirect(redirectTo,req);
        return Response.redirect(redirectTo,302);
    }
    case "c": {
        return handleCDN(req,pathAccessed,match[2]);
    }
    case "a": {
        return await handleAPI(req,pathAccessed,match[2]);
    }
    case "www": {
        return await handleWWW(req,pathAccessed,match[2]);
    }
    default: {
        return new Response();
    }
    }
}

export function startServer () {
    Bun.serve({
        port: config.port,
        fetch: handleReq
    });
    logMessage(`Successfully started! Access it now at http://${config.domain==="example.com"? "localhost:"+config.port:config.domain}`,"server");
}