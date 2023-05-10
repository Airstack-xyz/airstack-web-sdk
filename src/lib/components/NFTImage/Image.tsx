import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import { fetchCachedNFTAssetURL, fetchNFTAssetURL } from "./fetchNFTAssetURL";
import { Chain, PresetImageSize, PresetPXSize } from "../../constants";

export interface IAirstackAssetProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {
  chain?: Chain;
  address: string;
  tokenId: string;
  loading?: React.ReactNode;
  error?: React.ReactNode;
  imgProps?: React.DetailedHTMLProps<
    React.ImgHTMLAttributes<HTMLImageElement>,
    HTMLImageElement
  >;
  progressCallback?: (status: Status) => void;
  preset?: PresetImageSize;
}

enum Status {
  Loading = "loading",
  Loaded = "loaded",
  Error = "error",
}

const PresetArray = [
  PresetPXSize.ExtraSmall,
  PresetPXSize.Small,
  PresetPXSize.Medium,
  PresetPXSize.Large,
];

export const NftImage = (props: IAirstackAssetProps) => {
  const {
    chain = "ethereum",
    address,
    tokenId,
    loading,
    error,
    imgProps = {},
    preset,
    progressCallback,
  } = props;
  const presetRef = useRef(preset);
  const ref = useRef<HTMLDivElement>(null);

  const imageUri = useMemo(() => {
    if (!preset) {
      return "";
    }
    const imagesFromCache = fetchCachedNFTAssetURL(chain, address, tokenId);
    if (imagesFromCache && imagesFromCache.value && preset) {
      return imagesFromCache.value[preset];
    }
  }, [chain, preset, address, tokenId]);

  const [uri, setUri] = useState(imageUri);
  const [state, setState] = useState<Status>(
    imageUri ? Status.Loaded : Status.Loading
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

  const getSize = useCallback(() => {
    let height = 0;
    let width = 0;
    if (ref.current) {
      height = ref.current.clientHeight;
      width = ref.current.clientWidth;
    }
    return { height, width };
  }, []);

  const getPreset = useCallback((width: number) => {
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
  }, []);

  useEffect(() => {
    if (preset) {
      return;
    }
    const onResize = () => {
      const { width } = getSize();
      const currentPreset = getPreset(width);
      if (presetRef.current != currentPreset) {
        presetRef.current = currentPreset;
        const imagesFromCache = fetchCachedNFTAssetURL(chain, address, tokenId);
        if (presetRef.current && imagesFromCache && imagesFromCache.value) {
          setUri(imagesFromCache.value[presetRef.current]);
          updateState(Status.Loaded);
        }
      }
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, [chain, address, getPreset, getSize, preset, tokenId, updateState]);

  useEffect(() => {
    if (imageUri) {
      return;
    }
    fetchNFTAssetURL(chain, address, tokenId)
      .then((res: any) => {
        if (presetRef.current) {
          setUri(res.value[presetRef.current]);
        }
        updateState(Status.Loaded);
      })
      .catch(() => {
        updateState(Status.Error);
      });
  }, [chain, imageUri, address, tokenId, getSize, updateState]);

  let OUTPUT;

  if (state === Status.Loading) {
    OUTPUT = loading || (
      <div
        style={{
          backgroundColor: "#0E0E12",
          textAlign: "center",
          fontSize: "10px",
          lineHeight: "1em",
          color: "#96999c",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        Loading NFT...
      </div>
    );
  } else if (state === Status.Error) {
    OUTPUT = error || (
      <div
        style={{
          textAlign: "center",
          fontSize: "10px",
          lineHeight: "1em",
          color: "#96999c",
          backgroundColor: "#0E0E12",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        Error while loading NFT
      </div>
    );
  } else {
    OUTPUT = <img {...imgProps} alt="" src={uri} style={{ width: "100%" }} />;
  }

  const containerProp = useMemo(() => {
    const cProps: Record<string, any> = { ...props };
    delete cProps.chain;
    delete cProps.address;
    delete cProps.tokenId;
    delete cProps.loading;
    delete cProps.error;
    delete cProps.imgProps;
    delete cProps.progressCallback;
    delete cProps.preset;
    return cProps;
  }, [props]);

  return (
    <div
      {...containerProp}
      ref={ref}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
      }}
    >
      {OUTPUT}
    </div>
  );
};
