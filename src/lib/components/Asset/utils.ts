import { PresetArray, PresetPXSize } from "../../constants";

export type MediaType = "image" | "video" | "audio" | "unknown";

export function getMediaType(media: string): MediaType {
  const imageRegex = /\.(jpe?g|png|webp|gif|bmp|svg)$/i;
  const videoRegex = /\.(mp4|webm|avi|mov|mwv|mkv|ogv)$/i;
  const audioRegex = /\.(mp3|wav|aac|ogg|wma|aiff)$/i;

  if (imageRegex.test(media)) {
    return "image";
  }

  if (videoRegex.test(media)) {
    return "video";
  }

  if (audioRegex.test(media)) {
    return "audio";
  }

  return "unknown";
}

export function getSize(el?: HTMLElement | null) {
  let height = 0;
  let width = 0;
  if (el) {
    height = el.clientHeight;
    width = el.clientWidth;
  }
  return { height, width };
}

export function getPreset(el?: HTMLElement | null) {
  const { width } = getSize(el);
  const closest = PresetArray.reduce((prev, curr) => {
    return Math.abs(curr - width) < Math.abs(prev - width) ? curr : prev;
  });

  switch (closest) {
    case PresetPXSize.ExtraSmall:
      return "extraSmall";
    case PresetPXSize.Small:
      return "small";
    case PresetPXSize.Medium:
      return "medium";
    case PresetPXSize.Large:
      return "large";
    default:
      return "original";
  }
}

export async function getMediaTypeFromUrl(url: string) {
  const response = await fetch(url, {
    method: "HEAD",
  });

  const contentType = response.headers.get("content-type");

  if (contentType?.includes("image")) {
    return "image";
  }

  if (contentType?.includes("video")) {
    return "video";
  }

  if (contentType?.includes("audio")) {
    return "audio";
  }

  return "unknown";
}
