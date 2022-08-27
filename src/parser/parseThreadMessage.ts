import { Message as DiscordMessage } from 'discord.js';
import { Result } from './parseMessage';

export const parseThreadMessage1 = async (
  result: Result,
  message: DiscordMessage,
): Promise<string> => {
  const discordId = result.discordId ? result.discordId : message.author.id;
  const discordTag = result.discordId ? '-' : message.author.tag;

  return `<@${discordId}> | ${discordId} | ${discordTag}`;
};

export const parseThreadMessage2 = async (
  result: Result,
  message: DiscordMessage,
): Promise<string> => {
  // const { guildId, channelId, id } = message;
  // output += `<https://discord.com/channels/${guildId}/${channelId}/${id}>\n`;
  // const prefix = 'Original Message:\n';

  return message.content.substr(0, 2000);
};

export const parseThreadMessage3 = async (
  result: Result,
  message: DiscordMessage,
): Promise<string> => {
  return message.content.substr(2000, 4000);
};
