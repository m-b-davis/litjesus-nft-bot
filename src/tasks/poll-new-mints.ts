import { RichEmbed, TextChannel } from "discord.js";
import puppeteer, { Puppeteer } from "puppeteer";
import { getLastCounter, setHighestCounter } from "../io/counter";
import { attributeLookup } from "../constants/litjesus-attributes.constants";
import { LJMetadata } from "../types/litjesus.types";
import { round } from "../utils/math.utils";
import { AppConstants } from '../constants/app.constants';
import { getWalletPageUrl, NftEyezConstants } from '../constants/nfteyez.constants';
import { testMetadata } from '../mocks/metadata';
import { getRarityScoreMessage } from '../utils/litjesus.utils';
import { getMetadata } from '../utils/nfteyez.utils';

export async function startPollingForNewMints(
  channel: TextChannel,
  browser: puppeteer.Browser,
  welcomeMessage?: string
) {
  // Find target channel
  if (welcomeMessage) {
      channel.send(welcomeMessage);
  }

  if (AppConstants.POLL_FOR_MINTS) {

    const page = await browser.newPage();

    startPolling(page, channel);
  }
}

function startPolling(page: puppeteer.Page, channel: TextChannel) {
  const poll = async () => {
    console.log("Polling...");

    try {
      // Go to mint wallet address
      await page.goto(
        "https://nfteyez.global/accounts/3m4nX9M6Cq2WDjdi57Y6QmaQ8ethgJ1pt58pxKGatGSr"
      );
      await page.waitForSelector(NftEyezConstants.selectors.img);

      // Find images and names of mints
      const images = await page.$$<HTMLImageElement>(NftEyezConstants.selectors.img);
      const names = await page.$$<HTMLImageElement>(NftEyezConstants.selectors.names);

      // Get count - weirdly you can't count ElementHandles above, so you need to map over elements in the page like so
      const count = await page.$$eval(NftEyezConstants.selectors.names, (ele) => ele.length);

      for (let nftIndex = 0; nftIndex < count; nftIndex++) {
        const nameHandle = await names[nftIndex].getProperty("innerText");
        const nameValue = (await nameHandle?.jsonValue()) as string;
        const mintNumber = Number(nameValue.split(":")[1])
        
        const srcHandle = await images[nftIndex].getProperty("src");
        const srcValue = (await srcHandle?.jsonValue()) as string;

        console.log(mintNumber);

        // Check if this mint number is higher than the highest one we've seen (counter)
        if (mintNumber > getLastCounter()) {
          console.log('Found new mint!');
          await foundNewMint(
            images,
            nftIndex,
            page,
            mintNumber,
            srcValue,
            channel
          );
        }
      }
    } catch (ex) {
      console.error(ex);
      console.log("Failed! Will retry in " + AppConstants.REFRESH_DELAY + "ms");
    }
  };

  // Poll, then
  poll();

  // Run every REFRESH_DELAYms until we exit
  setInterval(poll, AppConstants.REFRESH_DELAY);
}

export async function foundNewMint(
  images: puppeteer.ElementHandle<HTMLImageElement>[],
  nftIndex: number,
  page: puppeteer.Page,
  mintNumber: number,
  srcValue: string,
  targetChannel: TextChannel
) {
  await images[nftIndex].click();
  await page.waitForSelector(NftEyezConstants.selectors.metadata);

  await getMetadata(page);

  const { image, genesisString } = getMintPostData(mintNumber, srcValue);

  // Update counter so we don't post this one (or any previous one) again
  setHighestCounter(mintNumber);

  await targetChannel.sendEmbed(image);

  // const rarityScoreMessage = getRarityScoreMessage(metadata);

  // sendRarityMessage(targetChannel, genesisString, rarityScoreMessage);
}


export function sendRarityMessage(
  targetChannel: TextChannel,
  genesisString: string,
  rarityScoreMessage: string
) {
  targetChannel.send(
    `**Rarity score breakdown for ${genesisString}:** \n${rarityScoreMessage}`
  );
}

function getMintPostData(mintNumber: number, srcValue: string) {
  const genesisString = `Genesis 1:${mintNumber}`;

  // Create embed post
  const image = new RichEmbed();
  image.setImage(srcValue);
  image.setDescription(genesisString);
  image.setTitle(`Genesis 1:${mintNumber} has just been minted!`);
  image.setURL(NftEyezConstants.walletPageUrl);
  return { image, genesisString };
}


