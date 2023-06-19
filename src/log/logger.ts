import { Client , Events} from 'discord.js';
import pino from 'pino';

const logger = pino({
    level: 'info',
    hooks: {
        logMethod(inputArgs, method, level) {
            const logLevel = logger.levels.labels[level]
            
            if (inputArgs.length >= 2) {
                const arg1 = inputArgs.shift()
                const arg2 = inputArgs.shift()
                return method.apply(this, [arg2, arg1, ...inputArgs])
            }
            return method.apply(this, inputArgs as [msg: string, ...args: any[]])
        }
    }
});

export function setupLogger(client: Client) {

    client.on(Events.Debug, m => logger.debug(m));
    client.on(Events.Warn, m => {
        logger.warn("A warning occurred")
        logger.warn(m)
    });
    client.on(Events.Error, m => {
        logger.error("An error occurred")
        logger.error(m)
    });
}

export default logger;