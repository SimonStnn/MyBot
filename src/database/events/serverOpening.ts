import { PresenceUpdateStatus } from "discord.js";
import client from "../../client";

export default async function serverOpening() {
    client.user?.setStatus(PresenceUpdateStatus.Online)
}