import { ActivityType, PresenceUpdateStatus } from "discord.js";
import client from "../../client";


export default async function serverClosed() {
    client.user?.setStatus(PresenceUpdateStatus.DoNotDisturb)
    client.user?.setActivity('for a database connection.', { type: ActivityType.Watching });
}