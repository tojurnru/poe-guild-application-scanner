import axios from 'axios';
import cheerio from 'cheerio';

import { axiosErrorHandler } from './errorHandler';

export type Profile = {
  status: string;
  guild?: string;
  joined?: string;
  lastVisit?: string;
  achievement?: string;
};

export type Characters = {
  name: string;
  league: string;
  classId: number;
  ascendancyClass: number;
  class: string;
  level: number;
  experience: number;
};

// user agent is required to call pathofexile.com api
const headers = {
  'User-Agent': 'tojurnru:poe-guild-application-scanner-bot',
};

export const fetchCharacters = async (
  accountName: string,
): Promise<Characters[]> => {
  try {
    const url = `https://www.pathofexile.com/character-window/get-characters?accountName=${accountName}`;

    const response = await axios.get(url, { headers });

    return response.data as Characters[];
  } catch (error) {
    if (axios.isAxiosError(error)) axiosErrorHandler(error);
    throw error;
  }
};

const getStatus = ($: cheerio.Root): string => {
  const notFoundStr = $('.layoutBoxContent .strip-heading')
    .first()
    .text()
    .trim();

  if (notFoundStr === 'Profile Not Found') {
    return 'Not Found';
  }

  const bannedStr = $('.roleLabel.banned').first().text().trim();
  if (bannedStr === 'Banned') {
    return 'Banned';
  }

  const privateStr = $('.container-content p').first().text().trim();

  const privateStrKeyword =
    'This profile tab has been set to private, or you lack the permissions to view it.';
  if (privateStr === privateStrKeyword) {
    return 'Private';
  }

  return 'Public';
};

export const fetchProfile = async (accountName: string): Promise<Profile> => {
  try {
    const url = `https://www.pathofexile.com/account/view-profile/${accountName}`;
    const response = await axios.get(url, { headers });
    const $ = cheerio.load(response.data);

    // get status
    const status = getStatus($);
    if (status !== 'Public') {
      return { status };
    }

    // get joined and last visit
    const box = $('.profile-box.profile').first();
    const rawText = box.text();

    const guildKeyword = 'Guild:';
    const guildIndex = rawText.indexOf(guildKeyword);
    const postKeyword = 'Forum Posts:';
    const postIndex = rawText.indexOf(postKeyword);
    const joinKeyword = 'Joined:';
    const joinIndex = rawText.indexOf(joinKeyword);
    const visitKeyword = 'Last Visited:';
    const visitIndex = rawText.indexOf(visitKeyword);

    const guildStart = guildIndex + guildKeyword.length;
    const guildLength = postIndex - guildStart;
    const joinStart = joinIndex + joinKeyword.length;
    const joinLength = visitIndex - joinStart;
    const visitStart = visitIndex + visitKeyword.length;

    const guild = rawText.substr(guildStart, guildLength).trim();
    const joined = rawText.substr(joinStart, joinLength).trim();
    const lastVisit = rawText.substr(visitStart).trim();

    // get achievements
    const box2 = $('.profile-box.achievements');
    const rawText2 = box2.text();

    const achieveKeyword = 'Achievements completed:';
    const achieveIndex = rawText2.indexOf(achieveKeyword);
    const achieveStart = achieveIndex + achieveKeyword.length;
    const achievement = rawText2.substr(achieveStart).trim();

    return {
      status,
      guild,
      joined,
      lastVisit,
      achievement,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) axiosErrorHandler(error);
    throw error;
  }
};

export default { fetchCharacters };
