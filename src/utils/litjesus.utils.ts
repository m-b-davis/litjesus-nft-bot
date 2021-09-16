import { attributeLookup } from '../constants/litjesus-attributes.constants';
import { LJMetadata } from '../types/litjesus.types';
import { round } from './math.utils';

// We post emojis for certain rare or interesting items
const emojiLookup = {
  "Color Swirl": "💎",
  "Good Evil": "💎",
  "Bob Ross": "💎",
  "Fully Lit Zorro": "🏆",
  "Mythical Mustache": "🤯",
  Sloth: "💫",
  "Laser Eyes": "🏮",
};


export function getMaxRarityScore() {
  const maxRarityScores = Object.values(attributeLookup)
  .map(lookup => {
    const rarest = Math.min(...Object.values(lookup)) / 100;
    const rarestScore = 1 / rarest;
    return rarestScore;
  });

  const maxRarityScore = maxRarityScores.reduce((a, b) => a + b, 0);;
  
  return round(maxRarityScore, 2);
}

export function getRarityScoreMessage(metadata: LJMetadata<number>) {
  const { attributes } = metadata.origin;
  const rarityScores = attributes.map(({ trait_type, value }) => {
    const rarityPercent: number  = attributeLookup[trait_type][value.trim()] / 100;
    const rarityScore = 1 / rarityPercent;
    if (isNaN(rarityScore)) {
      return { trait_type, rarityScore: 'Unknown', value };
    }
    return { trait_type, rarityScore, value };
  });

  const totalRarityScore = rarityScores
    .map(({ rarityScore }) => rarityScore)
    .filter(rarityScore => rarityScore !== 'Unknown')
    .reduce((a: number, b: number) => a + b, 0) as number;

  const hasUnknownScore = rarityScores
  .map(({ rarityScore }) => rarityScore).includes('Unknown');

  const totalRarityScoreMessage = hasUnknownScore ?  `** Total Score: At least ${round(totalRarityScore, 2)} **` : `** Total Score: ${round(totalRarityScore, 2)} **`; 

  const rarityScoreMessage = rarityScores
    .map(({ trait_type, rarityScore, value }) => {
      const rounded = round(rarityScore as number, 2);
      const special = emojiLookup[value] || "";
      return ` - ${trait_type}: *${value}*  = **${rounded}** ${special}`;
    })
    .concat(totalRarityScoreMessage)
    .join("\n");
  return "\n" + rarityScoreMessage;
}
