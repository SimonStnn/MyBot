import fs from 'node:fs';
import path from 'node:path';
import logger from "../log/logger";
import { MongoClient } from "mongodb";
import client from '../client';

export enum collection {
    CHAIN_CURRENT = "chainCurrent",
    CHAIN_USER = "chainUsers",
}

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
    } catch (err) {
        logger.warn(`Failed to connect to MongoDB.\n${err}`)
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