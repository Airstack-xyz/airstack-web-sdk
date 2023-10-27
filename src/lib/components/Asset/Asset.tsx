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
import { getPreset, getUrlFromData } from "./utils";
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
} & Omit<MediaProps, "data" | "onError" | "preset" | "onComplete" | "url">;

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
  const loadingRef = useRef(false);
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
      loadingRef.current = stateVal === Status.Loading;
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

  const url: string | null = getUrlFromData({ data, preset });
  // fetch only if there is no cached data, if cached data is there but no url
  const shouldFetch = state !== Status.Error && (!data || !url);

  useEffect(() => {
    if (!shouldFetch || loadingRef.current) {
      return;
    }

    updateState(Status.Loading);
    const forceFetch = Boolean(cachedData);

    fetchNFTAssetURL(chain, address, tokenId, forceFetch)
      .then((res) => {
        const url = getUrlFromData({ data: res.value, preset });
        // show error if there is no url
        updateState(!url ? Status.Error : Status.Loaded);
        setData(res.value);
      })
      .catch(() => {
        updateState(Status.Error);
      });
  }, [address, chain, preset, tokenId, updateState, shouldFetch, cachedData]);

  if (state === Status.Error) {
    return <>{error || <div className={styles.error}>Error!</div>}</>;
  }

  if (state === Status.Loading) {
    return <>{loading || <div className={styles.loading}>Loading...</div>}</>;
  }

  if (url) {
    return (
      <Media
        preset={preset}
        imgProps={imgProps}
        videoProps={videoProps}
        audioProps={audioProps}
        url={url}
        onError={() => {
          // error in loading media or unsupported media
          updateState(Status.Error);
        }}
        onComplete={() => updateState(Status.Loaded)}
      />
    );
  }

  return null;
};
