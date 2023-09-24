const types = {
    "bot": "Bot",
    "server": "Server",
    "redis": "Redis",
    "api": "API",
    "dws": "Discord WebSocket",
    "cdn": "CDN"
};

function generateDate(): string {
    const currentDate = new Date(Date.now() + 2 * 60 * 60000);
    let formattedDate = currentDate.toISOString().replace('T', ' ').replace('Z', '');
    return formattedDate;
}

function logMessage(string: string, type: "server" | "bot" | "redis" | "dws") {
    console.log(`[${types[type]} at ${generateDate()}] - ${string}`);
}

function logHTTPRequest(status: number, req: Request) {
    console.log(`[${types["server"]} at ${generateDate()}] - "${req.url}" ${status}`);
}

function logRedirect(redirectedTo: string, req: Request) {
    console.log(`[${types["server"]} at ${generateDate()}] - "${req.url}" --> "${redirectedTo}"`);
}

function logAPIRequest(status: number, req: Request) {
    if (req.url.includes("localhost:8080/")) return;
    console.log(`[${types["api"]} at ${generateDate()}] -"${req.url}" ${status}`);
}

export { logHTTPRequest, logMessage, logRedirect, logAPIRequest };