import axios from 'axios';
import parse = require('csv-parse/lib/sync');

import { axiosErrorHandler } from './errorHandler';

export type Blacklist = {
  account_name: string;
  discord_id: string;
  blacklisted_on: string;
  reason: string;
  active: string;
};

export const fetchBlacklist = async (): Promise<Blacklist[]> => {
  try {
    const url = `https://raw.githubusercontent.com/The-Forbidden-Trove/ForbiddenTroveBlacklist/main/blacklist.csv`;
    const response = await axios.get(url);
    const blacklists = parse(response.data, {
      columns: true,
      trim: true,
      skip_empty_lines: true,
    });

    const normalizedBlacklists = blacklists.map((blacklist: Blacklist) => {
      blacklist.account_name = blacklist.account_name.toLowerCase();
      return blacklist;
    });

    return normalizedBlacklists;
  } catch (error) {
    if (axios.isAxiosError(error)) axiosErrorHandler(error);
    throw error;
  }
};

export default { fetchBlacklist };
