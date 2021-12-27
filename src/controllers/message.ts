import path from 'path';
import { Message as DiscordMessage } from 'discord.js';

import { parseMessage } from '../parser/parseMessage';
import { parseOutput } from '../parser/parseOutput';
import { parseEmbed } from '../parser/parseEmbed';
import { parseThreadMessage } from '../parser/parseThreadMessage';
import { parseApplicationError } from '../parser/parseApplicationError';
import { postMessage, postRawMessage, postNewThread } from '../api/discord';
import ApplicationError from '../error/applicationError';

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

  try {
    const result = await parseMessage(message);

    // post message
    // const output = await parseOutput(result, message);
    // const newMessage = await postMessage(DISCORD_CHANNEL_OUTPUT, output);
    const output = await parseEmbed(result, message);
    const newMessage = await postRawMessage(DISCORD_CHANNEL_OUTPUT, output);

    // prepare thread message
    const threadOutput = await parseThreadMessage(result, message);

    // create thread and post thread message
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
      await parseApplicationError(err, message);
    } else {
      throw err;
    }
  }

};
