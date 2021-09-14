import { TextChannel, RichEmbed } from 'discord.js';
import { CommandoClient, SQLiteProvider } from "discord.js-commando";
import puppeteer from 'puppeteer';

var { token, prefix, supportServerInvite } = require("../config.json");
import path from "path";
import sqlite from 'sqlite';
import { getLastCounter, setHighestCounter } from './io/counter';

/**
 * Note - this was hacked together quickly and as such is a bit of a mess
 */


var bot: CommandoClient = new CommandoClient({
    commandPrefix: prefix,
    commandEditableDuration: 10,
    nonCommandEditable: true,
    invite: supportServerInvite
});

// Document query selectors for nftEyez
const selectors = {
    img: 'img[src]',
    names: 'h4',
};

bot.registry
    .registerGroups([
        ["bot", "Meta"]
    ])
    .registerDefaults()
    .registerCommandsIn(path.join(__dirname, 'commands'))
    .registerTypesIn(path.join(__dirname, 'types'));

sqlite.open(path.join(__dirname, 'database.sqlite3')).then(database => {
    bot.setProvider(new SQLiteProvider(database));
}).catch((e) => {
    console.error(`Failed to connect to database: ${e}`)
})

const REFRESH_DELAY = 10000;
const TARGET_CHANNEL_ID = '887105540931608608';

bot.on("ready", async () => {
    console.log(`${bot.user.username} is online!`);
    // Find target channel
    const target = bot.channels.get(TARGET_CHANNEL_ID);

    if (target?.type === 'text') {
        const targetChannel = target as TextChannel;
        targetChannel.send(`I'm starting up!`);

        const poll = async () => {
            console.log('Polling...');
            const browser = await puppeteer.launch( { headless: false });
            const page = await browser.newPage();

            try {
                // Go to mint wallet address
                await page.goto('https://nfteyez.global/accounts/3m4nX9M6Cq2WDjdi57Y6QmaQ8ethgJ1pt58pxKGatGSr');      
                await page.waitForSelector(selectors.img);
            
                // Find images and names of mints
                const images = await page.$$<HTMLImageElement>(selectors.img);
                const names = await page.$$<HTMLImageElement>(selectors.names);
    
                // Get count - weirdly you can't count ElementHandles above, so you need to map over elements in the page like so 
                const count =  await page.$$eval(selectors.names, ele => ele.length);
    
                for (let nftIndex = 0; nftIndex < count; nftIndex++){
                    const nameHandle = await names[nftIndex].getProperty('innerText');
                    const nameValue = await nameHandle?.jsonValue() as string;
                    const mintNumber = Number(nameValue.split(':')[1]);
                    console.log(mintNumber);

                    const srcHandle = await images[nftIndex].getProperty('src');
                    const srcValue = await srcHandle?.jsonValue() as string;
                    console.log(srcValue);
    
                    // Check if this mint number is higher than the highest one we've seen (counter)
                    if (mintNumber > getLastCounter()) {

                        // Create embed post
                        const image = new RichEmbed();
                        image.setImage(srcValue);
                        image.setDescription(`Genesis 1:${mintNumber}`);
                        image.setTitle(`Genesis 1:${mintNumber} has just been minted!`);
                        image.setURL('https://nfteyez.global/accounts/3m4nX9M6Cq2WDjdi57Y6QmaQ8ethgJ1pt58pxKGatGSr');
                       
                        targetChannel.sendEmbed(image);

                        // Update counter so we don't post this one (or any previous one) again
                        setHighestCounter(mintNumber);
                    }
                }
            } catch {
                console.log('Failed! Will retry in ' + REFRESH_DELAY + 'ms');
            }
        }

        // Poll, then
        poll();

        // Run every REFRESH_DELAYms until we exit
        setInterval(poll, REFRESH_DELAY);
    }
})

bot.login(token).catch(console.log);
