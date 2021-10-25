import path from 'path';
import { Message as DiscordMessage } from 'discord.js';

import { parseMessage } from '../parser/parseMessage';
import { parseOutput } from '../parser/parseOutput';
import { parseThreadOutput } from '../parser/parseThreadOutput';
import { postMessage, postNewThread } from '../api/discord';

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

  const length = message.content.indexOf('\n');
  const preview = message.content.substr(0, length >= 0 ? length : undefined);
  logger.debug(`${filename} | Message Received #${message.id}: ${preview}`);

  const result = await parseMessage(message);
  if (!result) {
    logger.debug(`${filename} | No Account Name Found.`);
    return;
  }

  const output = await parseOutput(result, message);
  const newMessage = await postMessage(DISCORD_CHANNEL_OUTPUT, output);

  const threadOutput = await parseThreadOutput(result, message);
  const channelName = `${message.author.tag} | ${result.accountName}`;
  await postNewThread(
    DISCORD_CHANNEL_OUTPUT,
    newMessage.id,
    channelName,
    threadOutput,
  );

  logger.debug(`${filename} | Message Processed #${message.id}.`);
};
