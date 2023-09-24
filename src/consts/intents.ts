export const intents = {
    Guilds: (1 << 0),
    GuildMembers: (1 << 1),
    GuildModeration: (1 << 2),
    GuildEmojisStickers: (1 << 3),
    GuildIntegrations: (1 << 4),
    GuildWebhooks: (1 << 5),
    GuildInvites: (1 << 6),
    GuildVoiceStates: (1 << 7),
    GuildPresences: (1 << 8),
    GuildMessages: (1 << 9),
    GuildMessageReactions: (1 << 10),
    GuildMessageTyping: (1 << 11),
    DMs: (1 << 12) + (1 << 13) + (1 << 14),
    GuildMessageContent: (1 << 15),
    GuildScheduledEvents: (1 << 16),
    AutoModConfiguration: (1 << 20),
    AutoModExecution: (1 << 21)
};