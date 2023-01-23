import path from 'path';
import moment from 'moment';

import logger from './logger';
import { Blacklist, fetchBlacklist } from '../api/github';

const filename = path.basename(__filename);

let blacklists: Blacklist[] = [];
let createdAt: Date;

export const getBlacklists = async (): Promise<Blacklist[]> => {
  // get local blacklist if we have record in the past 30 minutes
  const threshold = moment().subtract(30, 'minutes');
  if (createdAt && threshold.isBefore(createdAt)) {
    return blacklists;
  }

  // get blacklist from github
  logger.debug(`${filename} | get blacklist from github`);
  blacklists = await fetchBlacklist();
  createdAt = new Date();

  return blacklists;
};
