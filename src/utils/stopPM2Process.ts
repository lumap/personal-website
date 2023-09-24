import { exec } from "child_process";

export function stopPM2Process() {
    exec("pm2 stop lumapdotfr");
}