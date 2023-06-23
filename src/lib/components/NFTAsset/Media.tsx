import React, { useCallback, useEffect, useRef, useState } from "react";
import { PresetImageSize } from "../../constants";
import { NFTAssetURL } from "../../types";
import { MediaType, getMediaType, getMediaTypeFromUrl } from "./utils";
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
  onError: () => void;
  onComplete: () => void;
};

type AudioVideoProps = Omit<MediaProps, "data" | "preset" | "onComplete"> & {
  url: string;
};

function Audio({ url, audioProps, onError }: AudioVideoProps) {
  return (
    <audio
      controls
      className={styles.media}
      {...audioProps}
      onError={(error) => {
        onError();
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
        onError();
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
  onComplete,
}: Omit<MediaProps, "url">) {
  const [mediaType, setMediaType] = useState<MediaType | null>(null);
  const isLoadingRef = useRef(false);

  let url = "";

  if (data) {
    // use animation url if available, otherwise use video, audio, or image
    url =
      data.animation_url?.original ||
      data.video ||
      data.audio ||
      (data.image || {})[preset] ||
      "";
  }

  const handleUrlWithoutExtension = useCallback(
    async (url: string) => {
      if (isLoadingRef.current) return;

      isLoadingRef.current = true;
      try {
        const type = await getMediaTypeFromUrl(url);

        if (type !== "unknown") {
          setMediaType(type);
          onComplete();
        } else {
          // unsupported media, show error
          onError();
        }
      } catch (error) {
        onError();
      } finally {
        isLoadingRef.current = false;
      }
    },
    [onComplete, onError]
  );

  useEffect(() => {
    if (!url) return;
    const type = getMediaType(url);

    if (type === "unknown") {
      handleUrlWithoutExtension(url);
    } else {
      onComplete();
    }
  }, [handleUrlWithoutExtension, onComplete, url]);

  if (!mediaType) return null;

  if (mediaType === "image") {
    return (
      <img
        alt="NFT"
        className={styles.media}
        {...imgProps}
        src={url}
        onError={(error) => {
          onError();
          imgProps?.onError && imgProps.onError(error);
        }}
      />
    );
  }

  if (mediaType === "video") {
    return <Video url={url} videoProps={videoProps} onError={onError} />;
  }

  if (mediaType === "audio") {
    return <Audio url={url} audioProps={audioProps} onError={onError} />;
  }

  // unsupported media, show error
  onError();

  return null;
}
