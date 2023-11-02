import { Interaction, InteractionReplyOptions, } from "discord.js";
import Embed, { EmbedOptions } from "./embed";

export interface ResponseOptions extends EmbedOptions {
    interaction: Interaction,
    ephemeral?: boolean,
}

export default class Response extends Embed implements InteractionReplyOptions {
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