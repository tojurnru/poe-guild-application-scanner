import { Message as DiscordMessage } from 'discord.js';

import { postMessage } from '../api/discord';
import logger from '../controllers/logger';
import ApplicationError from '../error/applicationError';

const { DISCORD_CHANNEL_OUTPUT = '' } = process.env;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const parseApplicationError = async (err: ApplicationError, message: DiscordMessage): Promise<void> => {
  logger.error(`APPLICATION ERROR FOUND: ${err.message}`);

  // DM user
  let directMsg = `Your application post is deleted due to the following reason:\n`;
  directMsg += `**${err.message}**\n\n`;
  directMsg += `You are always welcomed to re-apply again once the above issue is resolved.\n\n`;
  directMsg += `Your Original Message:\n`;

  await message.author.send(directMsg);
  await delay(1000);

  const originalMessage = message.content.substr(0, 2000 - 8);

  await message.author.send('```\n' + originalMessage + '\n```');
  await delay(1000);

  await message.delete();
  await delay(1000);

  // Log
  const logMsg = `<@${message.author.id}>'s application deleted because: **${err.message}**`;
  await postMessage(DISCORD_CHANNEL_OUTPUT, logMsg);

};