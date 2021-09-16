import { CommandoClient, SQLiteProvider } from "discord.js-commando";
import path from "path";
import sqlite from "sqlite";
import puppeteer from "puppeteer";

import { AppConstants } from "./constants/app.constants";
import { startPollingForNewMints } from "./tasks/poll-new-mints";
import { findTargetChannel } from "./utils/discord.utils";
import { getWalletPageUrl } from './constants/nfteyez.constants';
import { getRarityScoreFromWallet } from './utils/nfteyez.utils';
import { getMaxRarityScore } from './utils/litjesus.utils';
import { Message } from 'discord.js';

var { token, prefix, supportServerInvite } = require("../config.json");

var bot: CommandoClient = new CommandoClient({
  commandPrefix: prefix,
  commandEditableDuration: 10,
  nonCommandEditable: true,
  invite: supportServerInvite,
});

bot.registry
  .registerGroups([["bot", "Meta"]])
  .registerDefaults()
  .registerCommandsIn(path.join(__dirname, "commands"))
  .registerTypesIn(path.join(__dirname, "types"));

sqlite
  .open(path.join(__dirname, "database.sqlite3"))
  .then((database) => {
    bot.setProvider(new SQLiteProvider(database));
  })
  .catch((e) => {
    console.error(`Failed to connect to database: ${e}`);
  });

let browser: puppeteer.Browser;

async function getBrowser() {
    if (!browser) {
        browser = await puppeteer.launch({ headless: AppConstants.HEADLESS });
    }

    return browser;
}


bot.on("ready", async () => {
  console.log(`${bot.user.username} is online!`);

  const channel = await findTargetChannel(bot, AppConstants.TARGET_CHANNEL_ID);
  const startupMessage = AppConstants.SHOULD_POST_STARTUP_MESSAGE
    ? AppConstants.STARTUP_MESSAGE
    : undefined;

//   const general = await findTargetChannel(bot, '867442048437059616');

  const browser = await getBrowser();

  await startPollingForNewMints(channel, browser, startupMessage);
});

bot.on('message', async (message) => {
    const { content } = message;
    console.log(content);
    // 'GgHJ1sNYgLQgSotJPdnHv5ShcHAFxfrZTnaMouAVe2RS'


    if (content.match(/^[A-z0-9]{42,45}$/) !== null && AppConstants.ALLOWED_RARITY_CHECK_CHANNELS.includes(message.channel.id)) {
        await tryGetRarity(message, content);
    } else if (content.startsWith('LJRarity ')) {
        const address = content.split('LJRarity ')[1];

        // I don't know how long a SOL address is lol
        const isValid = address.match(/^[A-z0-9]{42,45}$/) !== null;

        if (!AppConstants.ALLOWED_RARITY_CHECK_CHANNELS.includes(message.channel.id)) {
            message.reply('Please post in #rarity-check to check the rarity!');
            return;
        }

        if (isValid) {
            await tryGetRarity(message, address);

        } else {
            message.reply('Invalid address!');
        }
    }
})

bot.login(token).catch(console.log);
async function tryGetRarity(message: Message, address: string) {
    message.reply(`Checking...`);
    const browser = await getBrowser();
    const page = await browser.newPage();


    const responses = await getRarityScoreFromWallet(address, page, message.author.username);

    page.close();

    for (const response of responses) {
        await message.reply(response);
    }
}

