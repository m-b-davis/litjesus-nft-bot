// Document query selectors for nftEyez
export const selectors = {
  img: "img[src]",
  names: "h4",
  metadata: ".bg-black.py-4.px-8.rounded-xl.overflow-scroll.w-auto.mt-4",
};

const mintWalletAddress = '3m4nX9M6Cq2WDjdi57Y6QmaQ8ethgJ1pt58pxKGatGSr';

const baseUrl = "https://nfteyez.global/accounts/";

export function getWalletPageUrl(walletAddress: string) { 
  return `${baseUrl}${walletAddress}`;
}
export const NftEyezConstants = {
  walletPageUrl: getWalletPageUrl(mintWalletAddress),
  baseUrl,
  selectors,
}