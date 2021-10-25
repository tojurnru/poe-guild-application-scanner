import path from 'path';
import { User as DiscordUser, Message as DiscordMessage } from 'discord.js';

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
  accountName: string;
  charactersCount: number;
  characters95Count: number;
  blacklist?: Blacklist;
  poeAccountStatus: string;
  poeProfile?: PoeProfile;
};

export const parseMessage = async (
  message: DiscordMessage,
): Promise<Result | undefined> => {
  const { content, author, member } = message;

  let accountName = '';

  // extract answers
  content.split('\n').forEach((line: string) => {
    const [question, answer] = line.split(':');
    const questionLowercase = question.toLowerCase();

    if (questionLowercase.match(/acc.*nam/)) {
      if (answer) accountName = answer.trim();
    }
  });

  if (accountName === '') return;

  // check if account under blacklist
  const blacklists = await getBlacklists();
  const accountNameLowercase = accountName.toLowerCase();

  const found = blacklists.filter((blacklist: Blacklist) => {
    const { account_name, discord_id } = blacklist;
    return account_name === accountNameLowercase || discord_id === author.id;
  });

  // check if poe account public/private/not found
  let charactersCount = 0;
  let characters95Count = 0;
  let httpStatus = 200;
  try {
    logger.debug(`${filename} | fetching poe characters`);
    const characters = await fetchCharacters(accountName);
    charactersCount = characters.length;
    characters95Count = characters.filter(
      (character) => character.level >= 95,
    ).length;
  } catch (error) {
    const { status } = error.response;
    if (status === 403 || status === 404) {
      httpStatus = status;
    } else {
      throw error;
    }
  }

  const poeAccountStatus =
    httpStatus === 200
      ? 'public'
      : httpStatus === 403
      ? 'private'
      : 'not found';

  // get poe profile
  let poeProfile;
  if (httpStatus === 200) {
    logger.debug(`${filename} | fetching poe profile`);
    await delay(5000); // 5 seconds delay before calling pathofexile.com again
    poeProfile = await fetchProfile('tojurnru');
  }

  // return result
  return {
    accountName,
    charactersCount,
    characters95Count,
    blacklist: found.length > 0 ? found[0] : undefined,
    poeAccountStatus,
    poeProfile,
  };
};
