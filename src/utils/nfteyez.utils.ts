import {
  getWalletPageUrl,
  NftEyezConstants,
} from "../constants/nfteyez.constants";
import { LJMetadata } from "../types/litjesus.types";
import { getRarityScoreMessage } from "./litjesus.utils";
import puppeteer from "puppeteer";
import { RichEmbed } from "discord.js";

export async function getRarityScoreFromWallet(
  walletAddress: string,
  page: puppeteer.Page,
  authorName: string
): Promise<(string | RichEmbed)[]> {
  const targetUrl = getWalletPageUrl(walletAddress);
  await page.goto(targetUrl);

  try {
    await page.waitForSelector(NftEyezConstants.selectors.img, {
      timeout: 10000,
    });

    // Find images and names of mints
    const images = await page.$$<HTMLImageElement>(
      NftEyezConstants.selectors.img
    );
    const names = await page.$$<HTMLImageElement>(
      NftEyezConstants.selectors.names
    );

    // Get count - weirdly you can't count ElementHandles above, so you need to map over elements in the page like so
    const count = await page.$$eval(
      NftEyezConstants.selectors.names,
      (ele) => ele.length
    );

    for (let nftIndex = 0; nftIndex < count; nftIndex++) {
      const nameHandle = await names[nftIndex].getProperty("innerText");
      const nameValue = (await nameHandle?.jsonValue()) as string;

      if (nameValue.includes("Genesis 1:")) {
        console.log("Found LJ at index " + nftIndex);
        await names[nftIndex].click();
        await page.waitForSelector(NftEyezConstants.selectors.metadata);

        const metadata = await getMetadata(page);

        if (metadata.description === "Artwork hand painted by ABNDGO") {
          const genesisString = metadata.origin.name;

          // Create embed post
          const image = new RichEmbed();
          image.setImage(metadata.origin.image);
          const rarityScoreMessage = getRarityScoreMessage(metadata);

          image.setDescription(rarityScoreMessage);
          image.setTitle(`Rarity check by ${authorName} for ${genesisString}`);
          image.setURL(targetUrl);

          return [image];
        }
      }
    }
  } catch (ex) {
    console.error(ex);
  }

  return [
    `Couldn't find a Lit Jesus in this wallet!. Check ${getWalletPageUrl(
      walletAddress
    )}`,
  ];
}

export async function getMetadata(page: puppeteer.Page) {
  const metadataWrapperHandle = await page.$(
    NftEyezConstants.selectors.metadata
  );
  const metadataHandle = await metadataWrapperHandle?.getProperty("innerText");
  const metadataString = (await metadataHandle?.jsonValue()) as string;

  return JSON.parse(metadataString) as LJMetadata<number>;
}
