import { Client, Events, Message } from "discord.js";
import dontBreakTheChain from "../protocols/dbtc";
import { channelIds } from '../config.json'
import logger from "../log/logger";

export default {
    name: Events.MessageCreate,
    async execute(client: Client, message: Message) {
        if (message.author.bot || message.system) return;

        try {
            if (message.channel.id === channelIds.test) {
                // Handle new message to extend the chain
                dontBreakTheChain.handleNewLink(message)
            }
        } catch (err) {
            logger.error(err)
        }
    },
};
