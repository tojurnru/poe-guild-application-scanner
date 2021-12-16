import path from 'path';
import { Message as DiscordMessage } from 'discord.js';

import { Blacklist } from '../api/github';
import {
  Profile as PoeProfile,
  fetchCharacters,
  fetchProfile,
} from '../api/pathofexile';
import { getBlacklists } from '../controllers/blacklist';
import logger from '../controllers/logger';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const filename = path.basename(__filename);

export type Result = {
  discordId: string;
  accountName: string;
  characterName: string;
  poeProfile: PoeProfile;
  charactersCount: number;
  characters95Count: number;
  blacklist?: Blacklist;
};

export const parseMessage = async (
  message: DiscordMessage,
): Promise<Result | undefined> => {
  const { content, author } = message;

  logger.debug(content);

  let discordId = '';
  let accountName = '';
  let characterName = '';

  // extract account name
  const lines = content.split('\n');
  for (const line of lines) {
    const lineLowercase = line.toLowerCase();
    const words = line.split(/ |:/);
    const value = words[words.length - 1] || '';

    if (lineLowercase.match(/acc.*name.*:/)) {
      accountName = value;
    } else if (lineLowercase.match(/char.*name.*:/)) {
      characterName = value;
    } else if (lineLowercase.match(/discord.*id.*:/)) {
      discordId = value;
    }
  }

  logger.debug(`Account Name: ${accountName}`);
  if (accountName === '') return;

  // check if account under blacklist
  const blacklists = await getBlacklists();
  const accountNameLowercase = accountName.toLowerCase();

  const found = blacklists.filter((blacklist: Blacklist) => {
    const { account_name, discord_id } = blacklist;
    return account_name === accountNameLowercase || discord_id === author.id;
  });
  const blacklist = found.length > 0 ? found[0] : undefined;

  // get poe profile
  logger.debug(`${filename} | fetching poe profile`);

  let charactersCount = -1;
  let characters95Count = -1;

  const poeProfile = await fetchProfile(accountName);

  if (poeProfile.status !== 'Public') {
    return {
      discordId,
      accountName,
      characterName,
      poeProfile,
      charactersCount,
      characters95Count,
      blacklist,
    };
  }

  // get poe characters
  logger.debug(`${filename} | fetching poe characters`);
  await delay(5000); // 5 seconds delay before calling pathofexile.com again

  const characters = await fetchCharacters(accountName);
  const charNameLowercase = characterName.toLowerCase();

  const charFound = characters.find(
    (char) => char.name.toLowerCase() === charNameLowercase,
  );
  if (!charFound) {
    characterName += ' (Not Found)';
  }

  charactersCount = characters.length;
  characters95Count = characters.filter((char) => char.level >= 95).length;

  // return result
  return {
    discordId,
    accountName,
    characterName,
    poeProfile,
    charactersCount,
    characters95Count,
    blacklist,
  };
};
