import { Message as DiscordMessage } from 'discord.js';
import { Result } from './parseMessage';

export const parseOutput = async (
  result: Result,
  message: DiscordMessage,
): Promise<string> => {
  const {
    discordId,
    accountName,
    characterName,
    poeProfile,
    charactersCount,
    characters95Count,
    blacklist,
  } = result;

  // TODO obsolete. remove code?
  const discordTag = discordId ? `<@${discordId}>` : `<@${message.author.id}>`;

  let output = '';
  output += `${discordTag}\n`;
  output += `Account Name:  \`${accountName}\`\n`;
  output += `Character Name:  \`${characterName}\`\n`;
  output += `POE Account Status:  \`${poeProfile.status}\`\n`;

  if (poeProfile.status === 'Public') {
    output += `    Joined:  \`${poeProfile.joined}\`\n`;
    // output += `    Last Visited:  \`${poeProfile.lastVisit}\`\n`;
    output += `    Achievements:  \`${poeProfile.achievement}\`\n`;
    output += `    Total Characters:  \`${charactersCount} (${characters95Count} above Level 95)\`\n`;
  }

  output += `    Link:  <https://www.pathofexile.com/account/view-profile/${result.accountName}>\n`;

  if (!blacklist) {
    output += `TFT Blacklist:  No\n`;
    // output += `    Check Reputation At <https://discord.gg/F9E5v79P74>\n `;
    // output += `    Use Command:  \`!v @${message.author.tag}\`\n`;
  } else {
    output += `TFT Blacklist:  **YES**\n`;
    output += `    Account Name:  \`${blacklist.account_name}\`\n`;
    output += `    Discord ID:  \`${blacklist.discord_id}\`\n`;
    output += `    Reason:  \`${blacklist.reason}\`\n`;
    output += `    Blacklisted On:  \`${blacklist.blacklisted_on}\`\n`;
  }

  return output;
};
