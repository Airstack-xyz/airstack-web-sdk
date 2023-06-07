import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import { fetchCachedNFTAssetURL, fetchNFTAssetURL } from "./fetchNFTAssetURL";
import { Chain, PresetImageSize } from "../../constants";
import { Media, MediaProps } from "./Media";
import { getPreset } from "./utils";
// eslint-disable-next-line
// @ts-ignore
import styles from "./styles.module.css";

type DivProps = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
>;

export type IAirstackAssetProps = {
  chain?: Chain;
  address: string;
  tokenId: string;
  loading?: React.ReactNode;
  error?: React.ReactNode;
  progressCallback?: (status: Status) => void;
  preset?: PresetImageSize;
  containerClassName?: string;
} & DivProps &
  Omit<MediaProps, "data" | "onError" | "preset">;

enum Status {
  Loading = "loading",
  Loaded = "loaded",
  Error = "error",
}

export const NftAsset = (props: IAirstackAssetProps) => {
  const {
    chain = "ethereum",
    address,
    tokenId,
    loading,
    error,
    imgProps = {},
    videoProps = {},
    audioProps = {},
    preset: presetProp,
    progressCallback,
    containerClassName,
    ...containerProps
  } = props;

  const ref = useRef<HTMLDivElement>(null);
  const [preset, setPreset] = useState<PresetImageSize>(() => {
    if (presetProp) return presetProp;
    return getPreset(ref.current);
  });

  const cachedData = useMemo(() => {
    const assetCache = fetchCachedNFTAssetURL(chain, address, tokenId);
    if (assetCache && assetCache.value) {
      return assetCache.value;
    }
  }, [chain, address, tokenId]);

  const [data, setData] = useState(cachedData);
  const [state, setState] = useState<Status>(
    cachedData ? Status.Loaded : Status.Loading
  );

  const updateState = useCallback(
    (stateVal: Status) => {
      setState((prevState: Status) => {
        if (prevState != stateVal) {
          progressCallback && progressCallback(state);
          return stateVal;
        }
        return prevState;
      });
    },
    [progressCallback, state]
  );

  useEffect(() => {
    if (!presetProp) {
      setPreset(getPreset(ref.current));
    }
  }, [presetProp]);

  useEffect(() => {
    if (presetProp) {
      return;
    }
    const onResize = () => {
      const currentPreset = getPreset(ref.current);
      setPreset(currentPreset);
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, [chain, address, preset, tokenId, updateState, presetProp]);

  useEffect(() => {
    if (cachedData) {
      return;
    }
    fetchNFTAssetURL(chain, address, tokenId)
      .then((res) => {
        setData(res.value);
        updateState(Status.Loaded);
      })
      .catch(() => {
        updateState(Status.Error);
      });
  }, [chain, cachedData, address, tokenId, updateState]);

  const media = useMemo(() => {
    if (state === Status.Loading) {
      return loading || <div className={styles.loading}>Loading...</div>;
    } else if (state === Status.Error) {
      return error || <div className={styles.error}>Error!</div>;
    } else {
      return (
        <Media
          data={data}
          preset={preset}
          imgProps={imgProps}
          videoProps={videoProps}
          audioProps={audioProps}
          onError={() => {
            updateState(Status.Error);
          }}
        />
      );
    }
  }, [
    audioProps,
    data,
    error,
    imgProps,
    loading,
    preset,
    state,
    updateState,
    videoProps,
  ]);

  return (
    <div
      {...containerProps}
      ref={ref}
      className={`${styles.container}${
        containerClassName ? " " + containerClassName : ""
      }`}
    >
      {media}
    </div>
  );
};
