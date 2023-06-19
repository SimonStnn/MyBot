import { Client , Events} from 'discord.js';
import pino from 'pino';
const logger = pino();


export function setupLogger(client: Client) {
    logger.level = "info"

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