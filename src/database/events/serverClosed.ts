import { ActivityType, PresenceUpdateStatus } from "discord.js";
import client from "../../client";
import { connectToDatabase } from "../database";
import logger from "../../log/logger";

const wait = require('util').promisify(setTimeout);


export default async function serverClosed() {
    client.user?.setStatus(PresenceUpdateStatus.DoNotDisturb)
    client.user?.setActivity('for a database connection.', { type: ActivityType.Watching });

    await wait(60000)

    try {
        await connectToDatabase()
        logger.warn("Succesfully reconnected to database!")
    } catch (error) {
        logger.error(error, "Faired to reconnect to database.")
    }
}