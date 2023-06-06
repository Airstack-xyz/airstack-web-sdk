type MediaType = "image" | "video" | "audio" | "unknown";

export function getMediaType(media: string): MediaType {
  const imageRegex = /\.(jpe?g|png|gif|bmp|svg)$/i;
  const videoRegex = /\.(mp4|webm|avi|mov|mwv|mkv)$/i;
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
