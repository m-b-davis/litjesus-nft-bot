import { TextChannel } from 'discord.js';
import { CommandoClient } from 'discord.js-commando';

export async function findTargetChannel(bot: CommandoClient, targetChannelId: string) {
  const target = bot.channels.get(targetChannelId);

  if (!target) {
      throw new Error(`Unable to locate channel with ID ${targetChannelId}`)
  }

  if (target?.type !== "text") {
      throw new Error(`Target channel is of the wrong type - got type ${target.type} for channel ID ${targetChannelId}`)   
  }

  return target as TextChannel;
}