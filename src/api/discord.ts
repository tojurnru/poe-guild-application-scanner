import axios from 'axios';
import {
  Message as DiscordMessage,
  Channel as DiscordChannel,
} from 'discord.js';

import { axiosErrorHandler } from './errorHandler';

const { DISCORD_BOT_TOKEN = '' } = process.env;
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

export const postRawMessage = async (
  channelId: string,
  object: any,
): Promise<DiscordMessage> => {
  try {
    const url = `https://discord.com/api/channels/${channelId}/messages`;
    const config = { headers };
    const response = await axios.post(url, object, config);
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
  message1: string,
  message2: string,
  message3: string,
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
    await postMessage(threadChannel.id, message1);
    await delay(1000);

    await postMessage(threadChannel.id, message2);
    await delay(1000);

    if (message3.length > 0) {
      await postMessage(threadChannel.id, message3);
      await delay(1000);
    }
  } catch (error) {
    if (axios.isAxiosError(error)) axiosErrorHandler(error);
    throw error;
  }
};

export default { postMessage };
