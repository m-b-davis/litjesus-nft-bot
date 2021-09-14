# Lit Jesus NFT Mint Discord Bot
A Discord bot which prints when NFTs are minted for the LitJesus drop using discord.js, Commando, and TypeScript.

Discord: https://discord.com/channels/867442047723372545/
Twitter: https://twitter.com/thereallitjesus

Note - I'm not affiliated with the Lit Jesus project. 

![image](https://user-images.githubusercontent.com/15704216/133225258-11de9348-34b1-414d-9554-690e62b9c224.png)


This was knocked together quickly as a learning exercise on discord bots - please don't judge the code 😂.

## How does it work?
This bot uses Puppeteer to scrape the mint wallet address page - https://nfteyez.global/accounts/3m4nX9M6Cq2WDjdi57Y6QmaQ8ethgJ1pt58pxKGatGSr. 

We store a counter in counter.json to track the highest number minted - every time we see a result on this page with a higher number we post to discord at the channel ID set in index.ts (`TARGET_CHANNEL_ID`) with the image, link to the wallet and the mint number.

## Setup
 - Clone repo
 - `yarn` to install dependencies
 - Add your token to `config.json`. If you're new to discord bots - see https://www.digitaltrends.com/gaming/how-to-make-a-discord-bot/ to create a bot and then get the token once your bot is created.
 - `yarn run debug` to launch bot

## Donations
Feel free to send some SOL if you found this useful `8XfKd4dD2WW6Su6bQUHiqzgsBDag3xczNKS7aFCAKgU8`.

Or even better - go and spend it on buying your own Lit Jesus!
