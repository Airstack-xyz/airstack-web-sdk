import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import { fetchNFTAssetURL } from "./fetchNFTAssetURL";
import { Chain, PresetImageSize } from "../../constants";
import { Media, MediaProps } from "./Media";
import { getPreset } from "./utils";
// eslint-disable-next-line
// @ts-ignore
import styles from "./styles.module.css";
import { debounce } from "../../utils/debounce";
import { getFromAssetCache } from "../../cache/assets";

export type AssetProps = {
  chain?: Chain;
  address: string;
  tokenId: string;
  loading?: React.ReactNode;
  error?: React.ReactNode;
  progressCallback?: (status: Status) => void;
  preset?: PresetImageSize;
  containerClassName?: string;
} & Omit<MediaProps, "data" | "onError" | "preset" | "onComplete">;

enum Status {
  Loading = "loading",
  Loaded = "loaded",
  Error = "error",
}

export const AssetContent = (props: AssetProps) => {
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
  } = props;

  const ref = useRef<HTMLDivElement>(null);
  const [preset, setPreset] = useState<PresetImageSize>(() => {
    if (presetProp) return presetProp;
    return getPreset(ref.current);
  });

  const cachedData = useMemo(() => {
    const assetCache = getFromAssetCache(chain, address, tokenId);

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
          progressCallback && progressCallback(stateVal);
          return stateVal;
        }
        return prevState;
      });
    },
    [progressCallback]
  );

  const handleResize = useMemo(() => {
    return debounce(() => {
      const currentPreset = getPreset(ref.current);
      setPreset(currentPreset);
    });
  }, []);

  useEffect(() => {
    if (!presetProp) {
      setPreset(getPreset(ref.current));
    }
  }, [presetProp]);

  useEffect(() => {
    if (presetProp) {
      return;
    }
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [handleResize, presetProp]);

  useEffect(() => {
    if (cachedData) {
      return;
    }
    fetchNFTAssetURL(chain, address, tokenId)
      .then((res) => {
        setData(res.value);
      })
      .catch(() => {
        updateState(Status.Error);
      });
  }, [chain, cachedData, address, tokenId, updateState]);

  const media = useMemo(() => {
    if (state === Status.Error) {
      return error || <div className={styles.error}>Error!</div>;
    }
    return (
      <>
        {state === Status.Loading &&
          (loading || <div className={styles.loading}>Loading...</div>)}
        {data && (
          <Media
            data={data}
            preset={preset}
            imgProps={imgProps}
            videoProps={videoProps}
            audioProps={audioProps}
            onError={() => {
              updateState(Status.Error);
            }}
            onComplete={() => updateState(Status.Loaded)}
          />
        )}
      </>
    );
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

  return <>{media}</>;
};
