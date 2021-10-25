import path from 'path';
import { Message as DiscordMessage } from 'discord.js';

import { Result, parseMessage } from '../parser/parseMessage';
import { parseOutput } from '../parser/parseOutput';
import { postMessage } from '../api/discord';

import logger from './logger';

const { DISCORD_CHANNEL_INPUT = '', DISCORD_CHANNEL_OUTPUT = '' } = process.env;

const filename = path.basename(__filename);

const shouldParseMessage = (message: DiscordMessage): boolean => {
  // only process input channels
  if (message.channelId !== DISCORD_CHANNEL_INPUT) {
    return false;
  }

  return true;
};

export const handleMessage = async (message: DiscordMessage): Promise<void> => {
  if (!shouldParseMessage(message)) {
    return;
  }

  const preview = message.content.substr(0, 80);
  logger.debug(`${filename} | Message Received #${message.id}: ${preview}`);

  const result = await parseMessage(message);
  if (!result) {
    logger.debug(`${filename} | No Account Name Found.`);
    return;
  }

  const output = await parseOutput(result, message);

  await postMessage(DISCORD_CHANNEL_OUTPUT, output);
  logger.debug(`${filename} | Message Processed #${message.id}.`);
};
