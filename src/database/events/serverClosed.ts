import { ActivityType, GuildChannel, PresenceUpdateStatus } from "discord.js";
import client from "../../client";
import { channelIds } from '../../config.json'
import { connectToDatabase } from "../database";
import logger from "../../log/logger";

const wait = require('util').promisify(setTimeout);


export default async function serverClosed() {
    client.user?.setStatus(PresenceUpdateStatus.DoNotDisturb)
    client.user?.setActivity('for a database connection.', { type: ActivityType.Watching });

    const channel = client.channels.cache.get(channelIds.dontBreakChain) as GuildChannel
    await channel?.permissionOverwrites.edit(channel.guild.roles.everyone, {
        SendMessages: false,
    }).then(async () => logger.warn("Closed #dont-break-chain"));

    await wait(60000)

    try {
        await connectToDatabase()
        logger.warn("Succesfully reconnected to database!")
    } catch (error) {
        logger.error(error, "Faired to reconnect to database.")
    }
}