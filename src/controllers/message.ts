import path from 'path';
import { Message as DiscordMessage } from 'discord.js';

import { parseMessage } from '../parser/parseMessage';
import { parseOutput } from '../parser/parseOutput';
import { parseEmbed } from '../parser/parseEmbed';
import { parseThreadMessage1, parseThreadMessage2 } from '../parser/parseThreadMessage';
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

  logger.debug(`${filename} |\n${message.content}`);

  try {
    const result = await parseMessage(message);

    // post message
    // const output = await parseOutput(result, message);
    // const newMessage = await postMessage(DISCORD_CHANNEL_OUTPUT, output);
    const output = await parseEmbed(result, message);
    const newMessage = await postRawMessage(DISCORD_CHANNEL_OUTPUT, output);

    // prepare thread message
    const threadMessage1 = await parseThreadMessage1(result, message);
    const threadMessage2 = await parseThreadMessage2(result, message);

    // create thread and post thread message
    await postNewThread(
      DISCORD_CHANNEL_OUTPUT,
      newMessage.id,
      result.accountName,
      threadMessage1,
      threadMessage2,
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
