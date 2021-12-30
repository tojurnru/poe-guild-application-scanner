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
import ApplicationError from '../error/applicationError';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const filename = path.basename(__filename);

export type Result = {
  discordId: string;
  accountName: string;
  characterName: string;
  poeProfile: PoeProfile;
  charactersCount: number;
  characters80to94: number;
  characters95to100: number;
  blacklist?: Blacklist;
};

type PoeCharacter = {
  name: string;
  level: number;
};

export const parseMessage = async (
  message: DiscordMessage,
): Promise<Result> => {
  const { content, author } = message;

  let discordId = '';
  let accountName = '';
  let characterName = '';

  // extract account name
  const lines = content.split('\n');
  for (const line of lines) {
    const lineLowercase = line.trim().toLowerCase();
    const words = line.trim().split(/ |:/);
    const value = words[words.length - 1] || '';

    if (lineLowercase.match(/account.*name.*:/)) {
      accountName = value;
    } else if (lineLowercase.match(/character.*name.*:/)) {
      characterName = value;
    } else if (lineLowercase.match(/discord.*id.*:/)) {
      discordId = value;
    }
  }

  logger.debug(`Account Name: ${accountName}`);

  if (accountName === '') {
    const errMessage =
      'Account Name not found. Make sure it is written in a single line (Example: `Account Name: your-account-name`).';
    throw new ApplicationError(errMessage);
  }

  // get poe profile
  logger.debug(`${filename} | fetching poe profile`);

  const poeProfile = await fetchProfile(accountName);

  if (poeProfile.status !== 'Public') {
    throw new ApplicationError(
      `Account is ${poeProfile.status}. (<https://www.pathofexile.com/account/view-profile/${accountName}>)`,
    );
  }

  // get poe characters
  logger.debug(`${filename} | fetching poe characters`);
  await delay(5000); // 5 seconds delay before calling pathofexile.com again

  let characters: PoeCharacter[] = [];
  try {
    characters = await fetchCharacters(accountName);
  } catch (err) {
    if (err.response && err.response.status === 403) {
      const errMessage = `Account Character Page is not Public. (<https://www.pathofexile.com/account/view-profile/${accountName}/characters>).`;
      throw new ApplicationError(errMessage);
    } else {
      throw err;
    }
  }

  const charNameLowercase = characterName.toLowerCase();
  const charFound = characters.find(
    (char) => char.name.toLowerCase() === charNameLowercase,
  );
  if (!charFound) {
    // characterName += ' (Not Found)';
    let errMessage =
      'Character Name not found. Make sure it is written in a single line ';
    errMessage +=
      '(Example: `Character Name: your-character-name`), and it exist in your POE Account Character Page.';
    throw new ApplicationError(errMessage);
  }

  const charactersCount = characters.length;
  const characters80to94 = characters.filter(
    (char) => char.level >= 80 && char.level <= 94,
  ).length;
  const characters95to100 = characters.filter(
    (char) => char.level >= 95,
  ).length;

  // check if account under blacklist
  const blacklists = await getBlacklists();
  const accountNameLowercase = accountName.toLowerCase();

  const found = blacklists.filter((blacklist: Blacklist) => {
    const { account_name, discord_id } = blacklist;
    return account_name === accountNameLowercase || discord_id === author.id;
  });
  const blacklist = found.length > 0 ? found[0] : undefined;

  // return result
  return {
    discordId,
    accountName,
    characterName,
    poeProfile,
    charactersCount,
    characters80to94,
    characters95to100,
    blacklist,
  };
};
