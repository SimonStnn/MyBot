import { Client, Events, Message, TextChannel } from "discord.js";
import dontBreakTheChain from "../protocols/dbtc";
import { channelIds } from '../config.json'
import logger from "../log/logger";
import inputListener from '../protocols/inputListener';

export default {
    name: Events.MessageCreate,
    async execute(client: Client, message: Message) {
        if (message.author.bot || message.system) return;

        try {
            if (message.channel.id === channelIds.dontBreakChain) {
                // Handle new message to extend the chain
                dontBreakTheChain.handleNewLink(message)
            }
        } catch (err) {
            logger.error(err)
        }

        logger.info(`${message.author.tag} in #${(message.channel as TextChannel).name}: ${message.content}`)

        // Display channel info
        inputListener.displayChannelInfo()
    },
};
