import { Client, EmbedBuilder, } from "discord.js";
// import client from "../index"
const client = new Client({ intents: [] })

export const emptyCharachter = '\u200B'
export const emptyField = { name: emptyCharachter, value: emptyCharachter }

export interface EmbedOptions {
    title?: string | null,
    content?: string | null,
    fetchReply?: boolean,
}

export default class Embed extends EmbedBuilder {
    content?: string | undefined;
    tts?: boolean = false;
    fetchReply?: boolean | undefined;
    embeds: (EmbedBuilder)[] = [
        this.setTimestamp()
            .setColor("DarkPurple")
    ];

    constructor({ title, content, fetchReply }: EmbedOptions) {
        super()
        this.content = undefined;
        this.fetchReply = fetchReply
        this.setTitle(title ? title : null)
            .setDescription(content ? content : null)
            .setFooter({
                text: client.user?.username ?? "-",
                iconURL: client.user?.displayAvatarURL() ?? undefined
            })

    }
}