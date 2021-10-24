import discordClient from './controllers/discord';

const { DISCORD_BOT_TOKEN } = process.env;

const run = async () => {
  // login into discord and start streaming
  await discordClient.login(DISCORD_BOT_TOKEN);
};

run();
