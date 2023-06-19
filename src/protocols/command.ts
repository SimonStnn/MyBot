import { Client, Interaction, ChatInputCommandInteraction, SlashCommandBuilder, Message, CacheType } from "discord.js";

interface CommandOptions {
    data: SlashCommandBuilder | Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">
    execute: (client: Client, interaction: ChatInputCommandInteraction) => Promise<Response | any>
    category?: string;
}

export default class Command implements CommandOptions {
    data: SlashCommandBuilder | Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;
    execute: (client: Client<boolean>, interaction: ChatInputCommandInteraction<CacheType>) => Promise<Response | null>;
    category?: string;

    constructor(
        { data, execute, category }: CommandOptions
    ) {
        this.data = data
        this.execute = execute
        this.category = category
    }
}