import path from 'path';
import { Message as DiscordMessage } from 'discord.js';

import { parseMessage } from '../parser/parseMessage';
import { parseOutput } from '../parser/parseOutput';
import { parseThreadOutput } from '../parser/parseThreadOutput';
import { postMessage, postNewThread } from '../api/discord';
import ApplicationError from '../error/applicationError';

import logger from './logger';

const { DISCORD_CHANNEL_INPUT = '', DISCORD_CHANNEL_OUTPUT = '' } = process.env;

const filename = path.basename(__filename);

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const shouldParseMessage = (message: DiscordMessage): boolean => {
  // only process input channels
  if (message.channelId !== DISCORD_CHANNEL_INPUT) {
    return false;
  }

  return true;
};

const processInvalidApplication = async (err: ApplicationError, message: DiscordMessage) => {
  logger.error(`APPLICATION ERROR FOUND: ${err.message}`);

  let dm = `Your Application is denied due to the following reason:\n`;
  dm += `**${err.message}**\n\n`;
  dm += `You are always welcomed to re-apply again once the above issue is resolved.\n\n`;
  dm += `Your Original Message:\n`;

  await message.author.send(dm);
  await delay(1000);

  const originalMessage = message.content.substr(0, 2000 - 8);

  await message.author.send('```\n' + originalMessage + '\n```');
  await delay(1000);

  await message.delete();
  await delay(1000);
};

export const handleMessage = async (message: DiscordMessage): Promise<void> => {
  if (!shouldParseMessage(message)) {
    return;
  }

  const length = message.content.indexOf('\n');
  const preview = message.content.substr(0, length >= 0 ? length : undefined);
  logger.debug(`${filename} | Message Received #${message.id}: ${preview}`);

  try {
    const result = await parseMessage(message);

    const output = await parseOutput(result, message);
    const newMessage = await postMessage(DISCORD_CHANNEL_OUTPUT, output);

    const threadOutput = await parseThreadOutput(result, message);
    const discordName = result.discordId ? result.discordId : message.author.tag;
    const channelName = `${discordName} | ${result.accountName}`;
    await postNewThread(
      DISCORD_CHANNEL_OUTPUT,
      newMessage.id,
      channelName,
      threadOutput,
    );

    logger.debug(`${filename} | Message Processed #${message.id}.`);

  } catch (err) {
    if (err instanceof ApplicationError) {
      await processInvalidApplication(err, message);
    } else {
      throw err;
    }
  }

};
