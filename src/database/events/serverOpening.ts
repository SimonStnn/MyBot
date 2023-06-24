import { GuildChannel, PresenceUpdateStatus } from "discord.js";
import { channelIds } from '../../config.json'
import client from "../../client";
import logger from "../../log/logger";

export default async function serverOpening() {
    client.user?.setStatus(PresenceUpdateStatus.Online)

    const channel = client.channels.cache.get(channelIds.dontBreakChain) as GuildChannel
    await channel?.permissionOverwrites.edit(channel.guild.roles.everyone, {
        SendMessages: true,
    }).then(async () => logger.warn("Opened #dont-break-chain"));
}