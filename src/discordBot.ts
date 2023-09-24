import { DiscordClient } from "./classes/DiscordClient";
import { intents } from "./consts/intents";
import { config } from "../config";
import { Presence } from "./types/Presence";

let c: DiscordClient;

export async function getUserPresence(userId: string): Promise<Presence | "nouser" | "usernottracked"> {
    const user = await c.fetchUser(userId);
    if (!user) return "nouser";
    if (!(await c.fetchGuildMember(config.guildId, user.id))) return "usernottracked";
    const fetchedPresence = c.presences.get(`${config.guildId}:${user.id}`);
    const presence: Presence = {
        user,
        activity: fetchedPresence?.activities,
        clientStatus: fetchedPresence?.client_status
    };
    return presence;
}


export function startBot() {
    c = new DiscordClient(config.botToken, intents.Guilds + intents.GuildPresences + intents.GuildMembers);
}