export function timestampFromID(snowflake: bigint): number {
    const timestamp = ((snowflake >> 22n) + 1288834974657n) / 1000n;
    return Number(timestamp);
}