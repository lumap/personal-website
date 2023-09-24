import { ApplicationCommandOptionType, ApplicationCommandType, GatewayInteractionCreateDispatchData, InteractionType } from "discord-api-types/v10";

export function getStringOption(interaction: GatewayInteractionCreateDispatchData, name: string) {
    if (interaction.type !== InteractionType.ApplicationCommand) return;
    if (interaction.data.type !== ApplicationCommandType.ChatInput) return;
    const opt = interaction.data.options?.find(c => c.name === name);
    if (!opt) return;
    if (opt.type !== ApplicationCommandOptionType.String) return;
    return opt.value;
}
export function getBooleanOption(interaction: GatewayInteractionCreateDispatchData, name: string) {
    if (interaction.type !== InteractionType.ApplicationCommand) return;
    if (interaction.data.type !== ApplicationCommandType.ChatInput) return;
    const opt = interaction.data.options?.find(c => c.name === name);
    if (!opt) return;
    if (opt.type !== ApplicationCommandOptionType.Boolean) return;
    return opt.value;
}