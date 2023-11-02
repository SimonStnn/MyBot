import { Client, Collection, GatewayIntentBits } from 'discord.js';
import { Db, MongoClient } from 'mongodb';

declare module 'discord.js' {
    interface Client {
        commands: Collection<string, any>;
        dbClient: MongoClient
        database: Db
    }
}

class DiscordClient extends Client {
    private static instance: DiscordClient;

    private constructor() {
        super({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent,
            ]
        });
        // Set up additional configuration and event handlers
    }

    public static getInstance(): DiscordClient {
        if (!DiscordClient.instance) {
            DiscordClient.instance = new DiscordClient();
        }
        return DiscordClient.instance;
    }
}

const client = DiscordClient.getInstance();
export default client;

// Create a new client instance
// export default new Client({ intents: [GatewayIntentBits.Guilds] });

