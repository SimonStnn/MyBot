import fs from 'node:fs';
import path from 'node:path';
import logger from "../log/logger";
import { Collection, MongoClient, ObjectId } from "mongodb";
import client from '../client';

export enum collection {
    CHAIN_CURRENT = "chainCurrent",
    CHAIN_USER = "chainUsers",
}

export interface chainUserSchema {
    id: string,
    count: number,
    broken: number,
}
export interface chainCurrentSchema {
    chain: string,
    length: number,
    lastPerson: string
}

// let chainUserCollection = null
// export const chainUser = (() => {
//     if(!chainUserCollection)
//         chainUserCollection = client.database.collection<chainUserSchema>(collection.CHAIN_USER)
//     return chainUserCollection
// })()
// let chainCurrentCollection = null
// export const chainCurrent = (() => {
//     if (!chainCurrentCollection)
//         chainCurrentCollection = client.database.collection<chainCurrentSchema>(collection.CHAIN_CURRENT)
//     return chainCurrentCollection
// })()

let getChainUser: Promise<Collection<chainUserSchema>>
export const chainUser = new Proxy<Collection<chainUserSchema>>({} as Collection<chainUserSchema>, {
    get(target, prop) {
        return async function (...args: any[]) {
            const collection = await getChainUser;
            return (collection as any)[prop](...args);
        };
    },
})
let getChainCurrent: Promise<Collection<chainCurrentSchema>>
export const chainCurrent = new Proxy<Collection<chainCurrentSchema>>({} as Collection<chainCurrentSchema>, {
    get(target, prop) {
        return async function (...args: any[]) {
            const collection = await getChainCurrent;
            return (collection as any)[prop](...args);
        };
    },
})

export async function connectToDatabase() {
    const eventName = "serverClosed";
    client.dbClient.on(eventName, event => {
        console.log(`received ${eventName}: ${JSON.stringify(event, null, 2)}`);
    });

    try {
        logger.info("Connecting to MongoDB...");
        // Connect the client to the server	(optional starting in v4.7)
        await client.dbClient.connect();
        // Send a ping to confirm a successful connection
        await client.dbClient.db("admin").command({ ping: 1 });
        logger.info("Successfully connected to MongoDB!");
        
        // Save collections
        client.database = client.dbClient.db("discordBot")
        getChainUser = Promise.resolve(client.database.collection<chainUserSchema>(collection.CHAIN_USER))
        getChainCurrent = Promise.resolve(client.database.collection<chainCurrentSchema>(collection.CHAIN_CURRENT))
    } catch (err) {
        logger.warn(err,`Failed to connect to MongoDB.`)
    }
    return client.dbClient
}

export function handleDatabaseEvents(mongoClient: MongoClient) {
    const eventsPath = path.join(__dirname, 'events');
    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
    for (const file of eventFiles) {
        const filePath = path.join(eventsPath, file);
        const event = require(filePath).default;
        mongoClient.on(file.replace('.js', ''), event)
    }
}

export function addListener(event: string) {

}