import { Client, Interaction, ChatInputCommandInteraction, SlashCommandBuilder, Message } from "discord.js";

export default class Command {
    data: SlashCommandBuilder
    execute: (client: Client, interaction: ChatInputCommandInteraction) => Promise<Response | any>

    constructor(
        data: SlashCommandBuilder,
        execute: (client: Client, interaction: ChatInputCommandInteraction) => Promise<Response | any>
    ) {
        this.data = data
        this.execute = execute
    }
}