export const AIRSTACK_ENDPOINT = "https://api.dev.airstack.xyz/gql";

export enum PresetPXSize {
  ExtraSmall = 125,
  Small = 250,
  Medium = 500,
  Large = 750,
}
export type PresetImageSize =
  | "extraSmall"
  | "small"
  | "medium"
  | "large"
  | "original";

export const PresetArray = [
  PresetPXSize.ExtraSmall,
  PresetPXSize.Small,
  PresetPXSize.Medium,
  PresetPXSize.Large,
];

export type Chain = "ethereum" | "polygon";

export const API_ENDPOINT_PROD = "https://api.dev.airstack.xyz/gql";
