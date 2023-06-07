import { PresetImageSize } from "../../constants";
import { NFTAssetURL } from "../../types";
import { getMediaType } from "./utils";
// eslint-disable-next-line
// @ts-ignore
import styles from "./styles.module.css";

// !!! TODO: handle html, svg markup (SENITISE markup)

export type MediaProps = {
  imgProps?: React.DetailedHTMLProps<
    React.ImgHTMLAttributes<HTMLImageElement>,
    HTMLImageElement
  >;
  videoProps?: React.DetailedHTMLProps<
    React.ImgHTMLAttributes<HTMLVideoElement>,
    HTMLVideoElement
  >;
  audioProps?: React.DetailedHTMLProps<
    React.ImgHTMLAttributes<HTMLAudioElement>,
    HTMLAudioElement
  >;
  preset: PresetImageSize;
  data?: NFTAssetURL["value"];
  onError?: () => void;
};

type AudioVideoProps = Omit<MediaProps, "data" | "preset"> & {
  url: string;
};

function Audio({ url, audioProps, onError }: AudioVideoProps) {
  // TODO: confirm if we need autoplay here
  return (
    <audio
      autoPlay
      loop
      muted
      className={styles.media}
      {...audioProps}
      onError={(error) => {
        onError && onError();
        audioProps?.onError && audioProps.onError(error);
      }}
    >
      <source src={url} type="audio/mp3" />
      Your browser does not support the audio tag.
    </audio>
  );
}

function Video({ url, videoProps, onError }: AudioVideoProps) {
  // TODO: add logic for autoplay if the video length is less than 10 seconds
  return (
    <video
      autoPlay
      loop
      muted
      className={styles.media}
      {...videoProps}
      onError={(error) => {
        onError && onError();
        videoProps?.onError && videoProps.onError(error);
      }}
    >
      <source src={url} type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  );
}

export function Media({
  data,
  preset,
  imgProps,
  videoProps,
  audioProps,
  onError,
}: Omit<MediaProps, "url">) {
  if (!data) return null;

  const url =
    data.animation_url?.original ||
    (data.image || {})[preset] ||
    data.video ||
    data.audio;

  const type = getMediaType(url);

  if (type === "image") {
    return (
      <img
        alt="NFT"
        className={styles.media}
        {...imgProps}
        src={url}
        onError={(error) => {
          onError && onError();
          imgProps?.onError && imgProps.onError(error);
        }}
      />
    );
  }

  if (type === "video") {
    return <Video url={url} videoProps={videoProps} onError={onError} />;
  }

  if (type === "audio") {
    return <Audio url={url} audioProps={audioProps} onError={onError} />;
  }
  // TODO: Handle error here, as the type is not supported
  return null;
}
