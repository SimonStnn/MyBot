import { Client, ChatInputCommandInteraction, SlashCommandBuilder, CacheType, Events, PermissionsBitField } from "discord.js";
import client from "../client";
import logger from "../log/logger";

interface CommandOptions {
    data: SlashCommandBuilder | Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">
    execute: (client: Client, interaction: ChatInputCommandInteraction) => Promise<Response | any>
    category?: string;
    usage?: string
    requiredPermissions?: PermissionsBitField[]
    autocompleteChoices?: string[]
}

export default class Command implements CommandOptions {
    data: SlashCommandBuilder | Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;
    execute: (client: Client<boolean>, interaction: ChatInputCommandInteraction<CacheType>) => Promise<Response | null>;
    category?: string;
    usage?: string
    requiredPermissions?: PermissionsBitField[];

    constructor(
        { data, execute, category, autocompleteChoices }: CommandOptions
    ) {
        this.data = data
        this.execute = execute
        this.category = category

        if (autocompleteChoices) {
            client.on(Events.InteractionCreate, async (interaction) => {
                if (
                    !interaction.isAutocomplete() ||
                    interaction.commandName !== this.data.name
                ) return

                const focusedValue = interaction.options.getFocused();
                let filtered = autocompleteChoices
                    .filter((choice) => choice.startsWith(focusedValue))
                    .slice(0, 25);

                try {
                    await interaction.respond(
                        filtered.map((choice) => ({ name: choice, value: choice }))
                    );
                } catch (err) {
                    logger.error(err)
                }
            });
        }
    }
}