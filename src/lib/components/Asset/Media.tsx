import React, {
  ComponentProps,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { PresetImageSize } from "../../constants";
import { NFTAssetURL } from "../../types";
import { MediaType, getMediaType, getMediaTypeFromUrl } from "./utils";
// eslint-disable-next-line
// @ts-ignore
import styles from "./styles.module.css";
import { logError } from "../../utils/log";

// !!! TODO: handle html, svg markup (SANITIZE markup)

type HTMLVideoProps = ComponentProps<"video">;
type HTMLAudioProps = ComponentProps<"audio">;

export type MediaProps = {
  imgProps?: React.DetailedHTMLProps<
    React.ImgHTMLAttributes<HTMLImageElement>,
    HTMLImageElement
  >;
  videoProps?: {
    // max duration in seconds, if videos are shorter than this, they will be auto played, default 10 seconds
    maxDurationForAutoPlay?: number;
  } & HTMLVideoProps;
  audioProps?: HTMLAudioProps;
  preset: PresetImageSize;
  data?: NFTAssetURL["value"];
  onError: () => void;
  onComplete: () => void;
  url: string | null;
};

type AudioVideoProps = Omit<
  MediaProps,
  "data" | "preset" | "onComplete" | "url"
> & {
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
  preset,
  imgProps,
  videoProps,
  audioProps,
  onError,
  onComplete,
  url,
}: MediaProps) {
  const [mediaType, setMediaType] = useState<MediaType | null>(null);
  const isLoadingRef = useRef(false);

  const handleUrlWithoutExtension = useCallback(
    async (url: string) => {
      if (isLoadingRef.current) return;

      isLoadingRef.current = true;
      try {
        const type = await getMediaTypeFromUrl(url);
        setMediaType(type);
        onComplete();
        if (type === "unknown") {
          logError("unknown media type", url);
        }
      } catch (error) {
        logError(error);
      } finally {
        isLoadingRef.current = false;
      }
    },
    [onComplete]
  );

  useEffect(() => {
    if (url === null) return;

    const type = getMediaType(url);

    if (type === "unknown") {
      handleUrlWithoutExtension(url);
    } else {
      setMediaType(type);
      onComplete();
    }
  }, [handleUrlWithoutExtension, onComplete, url]);

  useEffect(() => {
    if (!url && mediaType) {
      logError("url is null");
      onError();
    }
  }, [mediaType, onError, preset, url]);

  if (!mediaType || !url) return null;

  if (mediaType === "video") {
    return <Video url={url} videoProps={videoProps} onError={onError} />;
  }

  if (mediaType === "audio") {
    return <Audio url={url} audioProps={audioProps} onError={onError} />;
  }

  // if we don't know the media type, we assume it's an image
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
