import { DiscordClient } from "../classes/DiscordClient";
import { baseURL } from "../consts/discordBaseURL";
import { config } from "../../config";
import { GatewayDispatchEvents, GatewayOpcodes, GatewayReceivePayload, GatewaySendPayload } from "discord-api-types/v10";
import { logMessage } from "../utils/logger";

const wsObject: { url: string; } = await fetch(`${baseURL}/gateway/bot`, {
    method: "GET",
    headers: {
        'Authorization': `Bot ${config.botToken}`,
    }
}).then(res => res.json());
if (!wsObject.url) {
    console.log(wsObject);
}

const reconnect = {
    can: false,
    resumeURL: "",
    sessionId: "",
    seq: 0
};

class CustomWS extends WebSocket {
    ended: boolean;

    constructor(s: string) {
        super(s);
        this.ended = false;
    }
}

function sendWSEvent(data: GatewaySendPayload, socket: CustomWS) {
    return socket.send(JSON.stringify(data));
};

function handleWSMessage(event: GatewayReceivePayload, socket: CustomWS, c: DiscordClient) {
    switch (event.op) {
        case GatewayOpcodes.Dispatch: {
            if (event.t === GatewayDispatchEvents.Ready) {
                logMessage(`Connected!`, "dws");
                reconnect.resumeURL = event.d.resume_gateway_url;
                reconnect.sessionId = event.d.session_id;
            }
            c.emit(event.t!, event.d);
            break;
        }
        case GatewayOpcodes.Heartbeat: {
            sendWSEvent({
                op: 1,
                d: reconnect.seq === 0 ? null : reconnect.seq
            }, socket);
            break;
        }
        case GatewayOpcodes.Reconnect: {
            socket.ended = true;
            socket.close(4069, "Got a Reconnect event");
            break;
        }
        case GatewayOpcodes.InvalidSession: {
            if (socket.ended) return;
            reconnect.can = event.d;
            socket.close(4999, "Invalid Session.");
            break;
        }
        case GatewayOpcodes.Hello: {
            setInterval(() => {
                sendWSEvent({
                    op: GatewayOpcodes.Heartbeat,
                    d: reconnect.seq === 0 ? null : reconnect.seq
                } as GatewaySendPayload, socket);
            }, event.d.heartbeat_interval + Math.random());
            sendWSEvent({
                op: GatewayOpcodes.Heartbeat,
                d: reconnect.seq === 0 ? null : reconnect.seq
            } as GatewaySendPayload, socket);
            if (reconnect.can) {
                const data = {
                    op: GatewayOpcodes.Resume,
                    d: {
                        token: `Bot ${c.token}`,
                        session_id: reconnect.sessionId,
                        seq: reconnect.seq
                    }
                } as GatewaySendPayload;
                return sendWSEvent(data, socket);
            }
            sendWSEvent({
                op: GatewayOpcodes.Identify,
                d: {
                    token: `Bot ${c.token}`,
                    intents: c.intents,
                    properties: {
                        os: "linux",
                        browser: "lumapdotfr-discordws",
                        device: "lumapdotfr-discordws"
                    },
                    presence: {
                        since: null,
                        status: "offline"
                    }
                }
            } as GatewaySendPayload, socket);
            break;
        }
        case GatewayOpcodes.HeartbeatAck: {
            // we don't need to do anything
            break;
        }
    }
}

export function startWS(c: DiscordClient) {
    const socket = new CustomWS(`${reconnect.can ? reconnect.resumeURL : wsObject.url}?v=10&encoding=json`);

    socket.onmessage = async function (event) {
        const parsedEvent = JSON.parse(event.data as string) as GatewayReceivePayload;
        if (parsedEvent.s != null) reconnect.seq = parsedEvent.s;
        if (parsedEvent.op === undefined) { // something fucked up
            console.log(parsedEvent);
            return;
        }
        handleWSMessage(parsedEvent, socket, c);
    };

    socket.onclose = function (e) {
        const reconnectAllowedCodes = [4000, 4001, 4002, 4003, 4005, 4007, 4008, 4009, 4069];
        reconnect.can = reconnectAllowedCodes.includes(e.code);
        startWS(c);
    };
}