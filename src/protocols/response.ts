import { Interaction, InteractionReplyOptions, } from "discord.js";
import Message from "./message";
import { MessageOptions } from "./message";

export interface ResponseOptions extends MessageOptions {
    interaction: Interaction,
    ephemeral?: boolean,
}

export default class Response extends Message implements InteractionReplyOptions {
    ephemeral?: boolean | undefined;

    constructor({ interaction, title, content, fetchReply, ephemeral }: ResponseOptions) {
        super({ title, content, fetchReply })
        this.ephemeral = ephemeral
        this.setFooter({
            text: interaction.user.username,
            iconURL: interaction.user.displayAvatarURL() ?? undefined
        })
    }
}