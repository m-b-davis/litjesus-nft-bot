const IS_LIVE = true;
const MOCK_MODE = false;
const HEADLESS = true;
const POLL_FOR_MINTS = true;
const SHOULD_POST_STARTUP_MESSAGE = true;
const SHOULD_POST_RARITY = false;
const STARTUP_MESSAGE = `I'm back!`;
const REFRESH_DELAY = 30000;
const TARGET_CHANNEL_ID = IS_LIVE ? "887105540931608608" : "887077195963592729";
const ALLOWED_RARITY_CHECK_CHANNELS = ["887077195963592729", "887765327075770429"];

export const AppConstants = {
  /** Should we post to the real LitJesus discord? */
  IS_LIVE,
  /** Should we use mock metadata? */
  MOCK_MODE,
  /** Should we post a startup message on connect? */
  SHOULD_POST_STARTUP_MESSAGE,
  /** Should we post the rarity in the channel? */
  SHOULD_POST_RARITY,
  /** The message to post to the target channel on connect */
  STARTUP_MESSAGE,
  /** The delay between polling NftEyez */
  REFRESH_DELAY,
  /** Discord channel ID to post in */
  TARGET_CHANNEL_ID,
  /** Channels allowed to post rarity checks in */
  ALLOWED_RARITY_CHECK_CHANNELS,
  /** Show browser */
  HEADLESS,
  /** Enable poll for mints */
  POLL_FOR_MINTS
};
