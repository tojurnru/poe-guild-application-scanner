import { channel } from 'diagnostics_channel';
import { Message as DiscordMessage } from 'discord.js';
import { Result } from './parseMessage';

export const parseOutput = async (
  result: Result,
  message: DiscordMessage,
): Promise<string> => {
  const { guildId, channelId, id } = message;

  let output = `~~**                                                                                                                     **~~\n`;

  output += `Account Name:  \`${result.accountName}\`\n`;
  output += `POE Account Status:  \`${result.poeAccountStatus}\`\n`;

  if (result.poeProfile) {
    output += `POE Profile:\n`;
    output += `    Joined:  \`${result.poeProfile.joined}\`\n`;
    output += `    Last Visited:  \`${result.poeProfile.lastVisit}\`\n`;
    output += `    Achievements:  \`${result.poeProfile.achievement}\`\n`;
  }

  output += `POE Link:  ||<https://www.pathofexile.com/account/view-profile/${result.accountName}>||\n`;
  output += '\n';

  if (!result.blacklist) {
    output += `TFT Blacklist:  No\n`;
    output += `    Check Reputation At <https://discord.gg/F9E5v79P74>\n`;
    output += `    Insert Command:  \`!v @${message.author.tag}\`\n`;
  } else {
    output += `TFT Blacklist:  **YES**\n`;
    output += `    Account Name:  \`${result.blacklist.account_name}\`\n`;
    output += `    Discord ID:  \`${result.blacklist.discord_id}\`\n`;
    output += `    Reason:  \`${result.blacklist.reason}\`\n`;
    output += `    Blacklisted On:  \`${result.blacklist.blacklisted_on}\`\n`;
  }

  output += '\n';
  output += `Message Link:  ||<https://discord.com/channels/${guildId}/${channelId}/${id}>||\n`;

  return output;
};
