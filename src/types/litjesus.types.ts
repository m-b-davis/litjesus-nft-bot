import { attributeLookup } from '../constants/litjesus-attributes.constants';

type GetAttribute<A extends Record<string, number>> = keyof A;

type LJAttributeLookup = typeof attributeLookup;

type LJTraitType = keyof LJAttributeLookup;

type GetLJAttributeValues<T> = T extends Record<string, number> ? GetAttribute<T> : never;

export type LJAttributeValue = GetLJAttributeValues<LJAttributeLookup[LJTraitType]>;

export type LJAttributeProperty = { trait_type: LJTraitType; value: LJAttributeValue };

export type LJFile = unknown;
export type LJCreator = unknown;

export type LJProperties = {
  files: LJFile[];
  category: "image";
  creators: LJCreator[];
};

export type LJMetadata<N extends number> = {
  name: `Genesis 1:${N}`;
  description: "Artwork hand painted by ABNDGO";
  image: `https://www.arweave.net/${string}`;
  external_url: string;
  origin: {
    name: `Genesis 1:${N}`;
    symbol: "";
    description: "Artwork hand painted by ABNDGO";
    seller_fee_basis_points: 500;
    image: `https://www.arweave.net/${string}`;
    attributes: LJAttributeProperty[];
    external_url: string;
    properties: LJProperties;
  };
};
