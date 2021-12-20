import { Message as DiscordMessage } from 'discord.js';
import { Result } from './parseMessage';

export const parseThreadOutput = async (
  result: Result,
  message: DiscordMessage,
): Promise<string> => {
  // const { guildId, channelId, id } = message;
  // output += `<https://discord.com/channels/${guildId}/${channelId}/${id}>\n`;

  const prefix = 'Original Message:\n';
  const trimMessage = message.content.substr(0, 2000 - prefix.length);

  return prefix + trimMessage;
};
