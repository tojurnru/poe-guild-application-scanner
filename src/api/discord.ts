import axios from 'axios';
import FormData from 'form-data';

import logger from '../controllers/logger';
import { axiosErrorHandler } from './errorHandler';

const { DISCORD_BOT_TOKEN = '', DISCORD_BOT_ID } = process.env;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const postMessage = async (
  channelId: string,
  message: string,
): Promise<void> => {
  // await rest.put(Routes.channel(channelId), { body: message });
  try {
    const url = `https://discord.com/api/channels/${channelId}/messages`;
    const headers = {
      Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
      'Content-Type': 'application/json',
    };
    const body = { content: message };

    await axios.post(url, body, { headers });
    await delay(1000); // prevent rate limit error
  } catch (error) {
    if (axios.isAxiosError(error)) axiosErrorHandler(error);
    throw error;
  }
};

export default { postMessage };
