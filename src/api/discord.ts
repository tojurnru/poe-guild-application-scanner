import axios from 'axios';
import {
  Message as DiscordMessage,
  Channel as DiscordChannel,
} from 'discord.js';

import logger from '../controllers/logger';
import { axiosErrorHandler } from './errorHandler';

const { DISCORD_BOT_TOKEN = '', DISCORD_BOT_ID } = process.env;
const headers = {
  Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
  'Content-Type': 'application/json',
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const postMessage = async (
  channelId: string,
  message: string,
): Promise<DiscordMessage> => {
  try {
    const url = `https://discord.com/api/channels/${channelId}/messages`;
    const body = { content: message };
    const config = { headers };
    const response = await axios.post(url, body, config);
    await delay(1000); // prevent rate limit error

    return response.data as DiscordMessage;
  } catch (error) {
    if (axios.isAxiosError(error)) axiosErrorHandler(error);
    throw error;
  }
};

export const postNewThread = async (
  channelId: string,
  messageId: string,
  channelName: string,
  message: string,
): Promise<void> => {
  try {
    // create new thread
    const url = `https://discord.com/api/channels/${channelId}/messages/${messageId}/threads`;
    const body = { name: channelName };
    const config = { headers };
    const response = await axios.post(url, body, config);
    await delay(1000); // prevent rate limit error

    // post message
    const threadChannel = response.data as DiscordChannel;
    await postMessage(threadChannel.id, message);
    await delay(1000); // prevent rate limit error
  } catch (error) {
    if (axios.isAxiosError(error)) axiosErrorHandler(error);
    throw error;
  }
};

export default { postMessage };
