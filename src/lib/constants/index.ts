export const AIRSTACK_ENDPOINT = "https://api.airstack.xyz/gql";

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

export type Chain = "ethereum";

export const API_ENDPOINT_DEV = "https://api.dev.airstack.xyz/gql";
export const API_ENDPOINT_PROD = "https://api.airstack.xyz/gql";
