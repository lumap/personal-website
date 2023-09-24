import { APIUser, GatewayActivity, GatewayPresenceClientStatus } from "discord-api-types/v10";

export interface Presence {
    activity?: GatewayActivity[],
    clientStatus?: GatewayPresenceClientStatus | null | undefined,
    user: APIUser
};