import { Client, Events, Message } from "discord.js";
import logger from "../log/logger";

export default {
    name: Events.MessageCreate,
    async execute(client: Client, message: Message) {

    },
};
