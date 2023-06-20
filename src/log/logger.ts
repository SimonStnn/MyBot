import { Client, Events, WebhookClient } from 'discord.js';
import pino from 'pino';

const webhook = new WebhookClient({ url: process.env.WEBHOOK_LOG as string });

const logger = pino({
    level: 'info',
    hooks: {
        logMethod(inputArgs, method, level) {
            const logLevel = logger.levels.labels[level]
            
            if (!inputArgs) return

            if (level > 40) {               
                addToBuffer(logLevel, inputArgs.join(" "));
                processBuffer();
            }

            if (inputArgs.length >= 2) {
                const arg1 = inputArgs.shift()
                const arg2 = inputArgs.shift()
                return method.apply(this, [arg2, arg1, ...inputArgs])
            }
            return method.apply(this, inputArgs as [msg: string, ...args: any[]])
        }
    }
});

const buffer: { name: string, args: any[] }[] = [];
let timer: NodeJS.Timeout | null = null;
const debounceTime = 3000;

async function addToBuffer(name: string, ...args: any[]) {
    buffer.push({ name, args });
}

function processBuffer() {
    if (timer) {
        // If there is already a timer running, do not start a new one
        return;
    }

    timer = setTimeout(() => {
        // Make a list with the contents
        const contents: string[] = []
        for (const { args } of buffer) {
            for (const arg of args) {
                contents.push(arg.toString())
            }
        }

        // Make API call
        logToChannel(buffer[0].name, ...contents);

        // Clear the buffer
        buffer.length = 0;

        // Reset the timer
        timer = null;
    }, debounceTime);
}

async function logToChannel(name: string, ...args: any) {
    const msg: string[] = [];

    for (let arg of args) {
        if (arg)
            msg.push(`\`\`\`ml\n${arg}\`\`\``);
    }

    try {
        await webhook.send({
            username: name.toString().split(':')[0].substring(0, 32), // set type of error as name and make sure its not longer then the max username length.
            avatarURL: 'https://www.shareicon.net/data/512x512/2016/08/18/809278_multimedia_512x512.png',
            content: msg.join('').substring(0, 2000),
        });
    } catch (e) {

    }
}

export default logger;