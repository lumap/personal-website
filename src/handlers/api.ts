import { getUserPresence } from "../discordBot";
import { logAPIRequest, logRedirect } from "../utils/logger";
import { APIError } from "../types/APIError";
import { getURLQueryParam } from "../utils/getURLQueryParam";
import { DiscordSnowflake } from "@sapphire/snowflake";
import { badgeList } from "../consts/discordBadges";
import dtypes from "discord-api-types/v10";
import ejs from "ejs";
import { Presence } from "../types/Presence";
import { getLangStrings } from "../utils/getLangStrings";
import { supportedLanguagesList } from "../consts/supportedLanguagesList";

export async function sendJSON(res: any, req: Request): Promise<Response> {
    logAPIRequest(200, req);
    return new Response(JSON.stringify(res), {
        status: 200,
        headers: {
            "content-type": "application/json; charset=utf-8"
        }
    });
}

export async function sendJSONError(err: APIError, req: Request): Promise<Response> {
    logAPIRequest(err.status, req);
    return new Response(JSON.stringify(err), {
        status: err.status,
        headers: {
            "content-type": "application/json; charset=utf-8"
        }
    });
}

function computePresenceCardHeight(p: Presence, userBadges: { value: number; name: string; url: string; }[], activities: dtypes.GatewayActivity[]) {
    let base = 308;
    if (p.user.banner) base += 60;
    if (p.activity?.find(c => c.name == "Custom Status")) base += 28;
    if (userBadges.length > 8) base += 22;
    base += (94 * activities.length);
    return base;
}

export async function handleAPI(req: Request, route: string): Promise<Response> {
    try {
        switch (route.split("/")[0].split("?")[0]) {
            case "presence": {
                const id = getURLQueryParam(req.url, "id");
                if (!id) return sendJSONError({ status: 401, errorMessage: "Parameter \"id\" is missing" }, req);
                const lang = getURLQueryParam(req.url, "lang") || "en";
                if (!supportedLanguagesList.includes(lang)) sendJSONError({
                    status: 401, errorMessage: "Language not valid"
                }, req);
                const presence = await getUserPresence(id);
                if (presence === "nouser") {
                    return sendJSONError({ status: 401, errorMessage: "User not found" }, req);
                }
                if (presence === "usernottracked") {
                    return sendJSONError({ status: 401, errorMessage: "Hi there! It looks like the bot can't track this user. If you want to use this API to obtain your presence in html (or json), please join https://discord.gg/S5yryjRuse so the bot can see your presence." }, req);
                }
                const format = getURLQueryParam(req.url, "format");
                if (!format || !["json", "html"].includes(format)) return sendJSONError({ status: 401, errorMessage: "Parameter \"format\" is not in the list: [\"json\",\"html\"]" }, req);
                if (format === "html") {
                    const date = new Date(DiscordSnowflake.timestampFrom(presence.user.id));
                    const formattedJoinDate = date.toLocaleString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric',
                    });
                    const customActivities = presence.activity?.filter(c => c.name !== "Custom Status") || [];
                    const customStatus = presence.activity?.find(c => c.name == "Custom Status");
                    const clientStatus = Object.values(presence.clientStatus || {})[0] || "offline";
                    const userBadges = badgeList.filter(c => c.value & Number(presence.user.flags));
                    const ActivityType = dtypes.ActivityType;
                    const h = computePresenceCardHeight(presence, userBadges, customActivities);
                    return new Response(await ejs.renderFile("views/partials/presence.ejs", { user: presence.user, formattedJoinDate, customActivities, customStatus, clientStatus, userBadges, ActivityType, h, strings: await getLangStrings(lang, "presence") }), {
                        headers: {
                            "content-type": "text/html; charset=utf-8",
                            'Access-Control-Allow-Origin': "*"
                        }
                    });
                }
                return sendJSON(presence, req);
            }
            case "botinvite": {
                const params = req.url.split("?")[1].split("&");
                const botId = params.find(c => c.startsWith("id="));
                if (!botId) return sendJSONError({ status: 401, errorMessage: "Parameter \"id\" is missing" }, req);
                const redirectTo = `https://discord.com/api/oauth2/authorize?client_id=${botId.split("=")[1]}&permissions=${params.find(c => c.startsWith("perms=")) || "8"}&scope=applications.commands%20bot`;
                logRedirect(redirectTo, req);
                return Response.redirect(redirectTo, 302);
            }
            default: {
                return sendJSONError({ status: 404, errorMessage: "where u at" }, req);
            }
        }
    } catch (e) {
        console.log(e);
        return sendJSONError({ status: 500, errorMessage: "U fucked up good" }, req);
    }
}