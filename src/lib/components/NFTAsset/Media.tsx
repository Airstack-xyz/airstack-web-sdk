import { useCallback, useRef } from "react";
import { PresetImageSize } from "../../constants";
import { NFTAssetURL } from "../../types";
import { getMediaType } from "./utils";
// eslint-disable-next-line
// @ts-ignore
import styles from "./styles.module.css";

// !!! TODO: handle html, svg markup (SENITISE markup)

type HTMLVideoProps = React.DetailedHTMLProps<
  React.ImgHTMLAttributes<HTMLVideoElement>,
  HTMLVideoElement
>;

export type MediaProps = {
  imgProps?: React.DetailedHTMLProps<
    React.ImgHTMLAttributes<HTMLImageElement>,
    HTMLImageElement
  >;
  videoProps?: {
    // max duration in seconds, if videos are shorter than this, they will be auto played, default 10 seconds
    maxDurationForAutoPlay?: number;
  } & HTMLVideoProps;
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
  return (
    <audio
      controls
      className={styles.media}
      {...audioProps}
      onError={(error) => {
        onError && onError();
        audioProps?.onError && audioProps.onError(error);
      }}
    >
      <source src={url} />
      Your browser does not support the audio tag.
    </audio>
  );
}

function Video({ url, videoProps: elementProps, onError }: AudioVideoProps) {
  const ref = useRef<HTMLVideoElement>(null);

  const {
    maxDurationForAutoPlay = 10,
    onLoadedMetadata,
    ...videoProps
  } = elementProps || {};

  const handleMetadata = useCallback(
    (metadata: React.SyntheticEvent<HTMLVideoElement, Event>) => {
      if (
        maxDurationForAutoPlay &&
        (metadata.target as HTMLVideoElement)?.duration < maxDurationForAutoPlay
      ) {
        if (ref.current) {
          ref.current.play();
        }
      }
      if (onLoadedMetadata) {
        onLoadedMetadata(metadata);
      }
    },
    [maxDurationForAutoPlay, onLoadedMetadata]
  );

  return (
    <video
      loop
      muted
      controls
      className={styles.media}
      {...videoProps}
      onLoadedMetadata={handleMetadata}
      ref={ref}
      onError={(error) => {
        onError && onError();
        videoProps?.onError && videoProps.onError(error);
      }}
    >
      <source src={url} />
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

  return "unsupported media";
}
