import EventEmitter from "events";
import { baseURL } from "../consts/discordBaseURL";
import { APIApplicationCommandInteraction, APIGuild, APIGuildMember, APIInteractionResponseCallbackData, APIUser, GatewayGuildCreateDispatchData, GatewayGuildUpdateDispatchData, GatewayPresenceUpdate, GatewayPresenceUpdateDispatchData, InteractionResponseType } from "discord-api-types/v10";
import { startWS } from "../discord_ws/ws";

export class DiscordClient extends EventEmitter {
    guilds = new Map<string, APIGuild>();
    token: string;
    intents: number;
    presences = new Map<string, GatewayPresenceUpdate>(); // key formatted like "guildId:userId"

    constructor(token: string, intents: number) {
        super();
        this.token = token;
        this.intents = intents;
        this.handleGuildEvents();
        startWS(this);
    }

    private handleGuildEvents() {
        this.on("GUILD_CREATE", (guild: GatewayGuildCreateDispatchData) => {
            this.guilds.set(guild.id, guild);
            guild.presences.forEach(p => this.presences.set(`${guild.id}:${p.user.id}`, p));
        });
        this.on("GUILD_UPDATE", (guild: GatewayGuildUpdateDispatchData) => {
            this.guilds.set(guild.id, guild);
        });
        this.on("GUILD_DELETE", (guild: APIGuild) => {
            this.guilds.delete(guild.id);
        });
        this.on("PRESENCE_UPDATE", (presence: GatewayPresenceUpdateDispatchData) => {
            this.presences.set(`${presence.guild_id}:${presence.user.id}`, presence);
        });
    }

    private async sendHTTPRequest(url: string, method: "GET" | "POST" | "PUT" | "DELETE" | "OPTIONS" | "PATCH", data?: any) {
        const req = await fetch(`${baseURL}/${url}`, {
            method,
            body: data ? JSON.stringify(data) : null,
            headers: {
                'Authorization': `Bot ${this.token}`,
                'Content-Type': 'application/json'
            }
        }).then(res => res.json());
        return req;
    }

    async fetchUser(id: string): Promise<APIUser | null> {
        return (await this.sendHTTPRequest(`users/${id}`, "GET")) as APIUser;
    }

    async replyToInteraction(interaction: APIApplicationCommandInteraction, data: APIInteractionResponseCallbackData) {
        return await this.sendHTTPRequest(`interactions/${interaction.id}/${interaction.token}/callback`, "POST", {
            type: InteractionResponseType.ChannelMessageWithSource,
            data
        });
    }

    async fetchGuildMember(guildId: string, userId: string): Promise<APIGuildMember | null> {
        return (await this.sendHTTPRequest(`guilds/${guildId}/members/${userId}`, "GET")) as APIGuildMember;
    }
}