import { Client, Interaction, ChatInputCommandInteraction, SlashCommandBuilder, Message } from "discord.js";

export default class Command {
    data: SlashCommandBuilder | Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">
    execute: (client: Client, interaction: ChatInputCommandInteraction) => Promise<Response | any>
    category: string | undefined;

    constructor(
        data: SlashCommandBuilder | Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">,
        execute: (client: Client, interaction: ChatInputCommandInteraction) => Promise<Response | any>
    ) {
        this.data = data
        this.execute = execute
    }
}