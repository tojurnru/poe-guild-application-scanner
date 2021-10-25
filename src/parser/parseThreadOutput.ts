import { channel } from 'diagnostics_channel';
import { Message as DiscordMessage } from 'discord.js';
import { Result } from './parseMessage';

export const parseThreadOutput = async (
  result: Result,
  message: DiscordMessage,
): Promise<string> => {
  const { guildId, channelId, id } = message;

  let output = 'Original Message:\n';
  output += `<https://discord.com/channels/${guildId}/${channelId}/${id}>\n`;
  output += message.content;

  return output;
};
