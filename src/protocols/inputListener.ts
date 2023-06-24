import { TextChannel } from 'discord.js';
import { channelIds } from '../config.json';
import readline from 'readline';
import client from '../client';
import logger from '../log/logger';

class InputListener {
    private static instance: InputListener;
    currentChannel?: TextChannel
    // Set up the terminal input
    rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });

    public static getInstance(): InputListener {
        if (!InputListener.instance) {
            InputListener.instance = new InputListener();
        }
        return InputListener.instance;
    }

    constructor() {
        // Prompt the user for input and send messages to Discord channels
        this.rl.on('line', async input => this.onInput(input));

        this.displayChannelInfo()
    }

    async onInput(message: string) {
        try {
            const content = message.split(' ')
            switch (content[0]) {
                case "switch": this.changeChannel(content[1]); break;
                default: await this.sendMessage(message); break;
            }
        } catch (error) {
            logger.error(error)
        }
        console.log();
        this.displayChannelInfo()
    }

    // display the current channel information in terminal
    displayChannelInfo() {
        if (!this.currentChannel) console.log('Current Channel: None');
        else console.log(`Current Channel: #${this.currentChannel.name} (${this.currentChannel.id})`);
    }

    async sendMessage(message: string) {
        if (!message) return
        if (!this.currentChannel) return console.log("Not in a channel")
        await this.currentChannel.send(message)
    }

    changeChannel(channelId: string) {
        const channel = client.channels.cache.get(channelId) as TextChannel
        if (!channel) return console.log(`Channel '${channelId}' was not found`)
        this.currentChannel = channel
    }
}
const inputListener = InputListener.getInstance();
export default inputListener;
