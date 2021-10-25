import path from 'path';
import { Client, Intents } from 'discord.js';

import logger from './logger';
import { handleMessage } from './message';

const filename = path.basename(__filename);

const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});

client
  .on('ready', () => {
    logger.info(`logged in as ${client.user?.tag}`);
  })
  .on('debug', (info) => {
    logger.silly(`${filename} | debug: ${info}`);
  })
  .on('messageCreate', handleMessage)
  .on('error', (err) => {
    logger.error(`${filename} | ${err}`);
    logger.error(err);
  });

export default client;
